# Copyright: (c) OpenSpug Organization. https://github.com/openspug/spug
# Copyright: (c) <spug.dev@gmail.com>
# Released under the AGPL-3.0 License.
from channels.routing import ProtocolTypeRouter
from consumer import routing

try:
    from django.core.asgi import get_asgi_application
except ImportError:
    from channels.http import AsgiHandler

    def get_asgi_application():
        return AsgiHandler

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': routing.ws_router
})
