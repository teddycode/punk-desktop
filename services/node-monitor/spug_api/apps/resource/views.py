from django.views.generic import View
from libs import json_response, auth
from libs.spug import Notification
from libs.push import get_contacts
from apps.host.models import Host
from apps.setting.utils import AppSetting
import requests
from apps.resource.utils import getResourceCmd

class ResourceView(View):
    @auth('mapnode.nodemessage.view')
    def get(self, request):
        hosts = Host.objects.all()
        resp = []
        for host in hosts:
            try:
                with host.get_ssh() as ssh:
                    cmd = getResourceCmd(host)
                    code, out = ssh.exec_command_raw(cmd)
                    print("获取返回信息：",out)
                    if code == 0:
                        resp.append(out)
                    else:
                        resp.append({'node_name': host.hostname, 'error': f"code: {code}"})
            except requests.RequestException as error:
                return json_response(error=error)
        return json_response(resp)

class LocationView(View):
    @auth('mapnode.nodemessage.view')
    def get(self, request):
        hosts = Host.objects.all()
        response = []
        for host in hosts:
             extend = host.hostextend
             print("扩展信息",extend)
             if(extend.longitude != '' and extend.latitude != ''):
                response.append({
                    'name': host.name,
                    'lng': extend.longitude,
                    'lat': extend.latitude,
                })
        return json_response(response)
   