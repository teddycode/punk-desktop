# Copyright: (c) OpenSpug Organization. https://github.com/openspug/spug
# Copyright: (c) <spug.dev@gmail.com>
# Released under the AGPL-3.0 License.
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
from django.db import OperationalError
from .utils import json_response, get_request_real_ip
from apps.account.models import User
from apps.setting.utils import AppSetting
import logging
import traceback
import time


logger = logging.getLogger(__name__)


def _is_database_locked(error):
    message = str(error).lower()
    return 'database is locked' in message or 'database table is locked' in message


def _refresh_token_expiry(user):
    now = time.time()
    current_expiry = user.token_expired or 0
    refresh_interval = getattr(settings, 'TOKEN_REFRESH_INTERVAL', 5 * 60)
    if current_expiry - now > refresh_interval:
        return

    new_expiry = int(now + settings.TOKEN_TTL)
    retry_count = max(int(getattr(settings, 'TOKEN_REFRESH_RETRIES', 3)), 1)
    for attempt in range(retry_count):
        try:
            updated = User.objects.filter(pk=user.pk, token_expired=current_expiry).update(
                token_expired=new_expiry
            )
            if updated:
                user.token_expired = new_expiry
            return
        except OperationalError as error:
            if not _is_database_locked(error):
                raise
            if attempt == retry_count - 1:
                logger.warning('Skipped token refresh because the SQLite database is locked')
                return
            time.sleep(0.05 * (attempt + 1))


class HandleExceptionMiddleware(MiddlewareMixin):
    """
    处理试图函数异常
    """

    def process_exception(self, request, exception):
        traceback.print_exc()
        return json_response(error='Exception: %s' % exception)


class AuthenticationMiddleware(MiddlewareMixin):
    """
    登录验证
    """

    def process_request(self, request):
        if request.path in settings.AUTHENTICATION_EXCLUDES:
            return None
        if any(x.match(request.path) for x in settings.AUTHENTICATION_EXCLUDES if hasattr(x, 'match')):
            return None
        access_token = request.headers.get('x-token') or request.GET.get('x-token')
        if access_token and len(access_token) == 32:
            x_real_ip = get_request_real_ip(request.headers)
            user = User.objects.filter(access_token=access_token).first()
            if user and user.token_expired >= time.time() and user.is_active:
                if x_real_ip == user.last_ip or AppSetting.get_default('bind_ip') is False:
                    request.user = user
                    _refresh_token_expiry(user)
                    return None
        response = json_response(error="验证失败，请重新登录")
        response.status_code = 401
        return response
