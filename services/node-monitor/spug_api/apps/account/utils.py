# Copyright: (c) OpenSpug Organization. https://github.com/openspug/spug
# Copyright: (c) <spug.dev@gmail.com>
# Released under the AGPL-3.0 License.
from apps.host.models import Group
from apps.account.models import User
import ipaddress
import re
import time
import uuid

from apps.setting.utils import AppSetting
from libs.utils import get_request_real_ip, human_datetime


DEFAULT_ADMIN_USERNAME = 'admin'
DEFAULT_ADMIN_NICKNAME = '管理员'
DEFAULT_ADMIN_PASSWORD = 'Admin123A'


def get_host_perms(user):
    ids = sub_ids = set(user.group_perms)
    while sub_ids:
        sub_ids = [x.id for x in Group.objects.filter(parent_id__in=sub_ids)]
        ids.update(sub_ids)
    return set(x.host_id for x in Group.hosts.through.objects.filter(group_id__in=ids))


def has_host_perm(user, target):
    if user.is_supper:
        return True
    host_ids = get_host_perms(user)
    if isinstance(target, (list, set, tuple)):
        return set(target).issubset(host_ids)
    return int(target) in host_ids


def verify_password(password):
    if len(password) < 8:
        return False
    if not all(map(lambda x: re.findall(x, password), ['[0-9]', '[a-z]', '[A-Z]'])):
        return False
    return True


def ensure_default_admin():
    user = User.objects.filter(username=DEFAULT_ADMIN_USERNAME).order_by('id').first()
    if not user:
        return User.objects.create(
            username=DEFAULT_ADMIN_USERNAME,
            nickname=DEFAULT_ADMIN_NICKNAME,
            password_hash=User.make_password(DEFAULT_ADMIN_PASSWORD),
            type='default',
            is_supper=True,
            is_active=True,
            access_token='',
            token_expired=0,
            last_login='',
            last_ip='',
        )

    update_fields = []
    if not user.nickname:
        user.nickname = DEFAULT_ADMIN_NICKNAME
        update_fields.append('nickname')
    if not user.password_hash:
        user.password_hash = User.make_password(DEFAULT_ADMIN_PASSWORD)
        update_fields.append('password_hash')
    if user.type != 'default':
        user.type = 'default'
        update_fields.append('type')
    if not user.is_supper:
        user.is_supper = True
        update_fields.append('is_supper')
    if not user.is_active:
        user.is_active = True
        update_fields.append('is_active')
    if user.deleted_at:
        user.deleted_at = None
        update_fields.append('deleted_at')
    if user.deleted_by_id is not None:
        user.deleted_by = None
        update_fields.append('deleted_by')
    if update_fields:
        user.save(update_fields=update_fields)
    return user


def build_user_session(request, user, ttl):
    x_real_ip = get_request_real_ip(request.headers)
    token_isvalid = user.access_token and len(user.access_token) == 32 and user.token_expired >= time.time()
    user.access_token = user.access_token if token_isvalid else uuid.uuid4().hex
    user.token_expired = time.time() + ttl
    user.last_login = human_datetime()
    user.last_ip = x_real_ip
    user.save(update_fields=('access_token', 'token_expired', 'last_login', 'last_ip'))
    verify_ip = AppSetting.get_default('verify_ip', True)
    has_real_ip = True
    if verify_ip:
        try:
            has_real_ip = bool(x_real_ip) and ipaddress.ip_address(x_real_ip).is_global
        except ValueError:
            has_real_ip = False
    return {
        'id': user.id,
        'access_token': user.access_token,
        'nickname': user.nickname,
        'is_supper': user.is_supper,
        'has_real_ip': has_real_ip,
        'permissions': [] if user.is_supper else list(user.page_perms)
    }
