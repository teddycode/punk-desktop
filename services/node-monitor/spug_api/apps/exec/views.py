# Copyright: (c) OpenSpug Organization. https://github.com/openspug/spug
# Copyright: (c) <spug.dev@gmail.com>
# Released under the AGPL-3.0 License.
from django.views.generic import View
from django_redis import get_redis_connection
from django.conf import settings
from libs import json_response, JsonParser, Argument, human_datetime, auth
from apps.exec.models import ExecTemplate, ExecHistory, ExecConfig, Execrelateconfig, Execrelatetemplate
from apps.app.models import App
from apps.host.models import Host
from apps.account.utils import has_host_perm
from datetime import datetime
from django.http import JsonResponse 
import uuid
import json
import os


class TemplateView(View):
    @auth('exec.template.view|exec.task.do|schedule.schedule.add|schedule.schedule.edit|\
    monitor.monitor.add|monitor.monitor.edit')
    def get(self, request):
        templates = ExecTemplate.objects.all()
        types = [x['type'] for x in templates.order_by('type').values('type').distinct()]
        return json_response({'types': types, 'templates': [x.to_view() for x in templates]})

    @auth('exec.template.add|exec.template.edit')
    def post(self, request):
        form, error = JsonParser(
            Argument('id', type=int, required=False),
            Argument('name', help='请输入模版名称'),
            Argument('type', help='请选择模版类型'),
            Argument('body', help='请输入模版内容'),
            Argument('interpreter', default='sh'),
            Argument('host_ids', type=list, handler=json.dumps, default=[]),
            Argument('parameters', type=list, handler=json.dumps, default=[]),
            Argument('desc', required=False)
        ).parse(request.body)
        if error is None:
            if form.id:
                form.updated_at = human_datetime()
                form.updated_by = request.user
                ExecTemplate.objects.filter(pk=form.pop('id')).update(**form)
            else:
                form.created_by = request.user
                ExecTemplate.objects.create(**form)
        return json_response(error=error)

    @auth('exec.template.del')
    def delete(self, request):
        form, error = JsonParser(
            Argument('id', type=int, help='请指定操作对象')
        ).parse(request.GET)
        if error is None:
            ExecTemplate.objects.filter(pk=form.id).delete()
            Execrelatetemplate.objects.filter(template_id = form.id).delete()
        return json_response(error=error)
    
class RelatedTempView(View):
    @auth('exec.relatedTemp.view')
    def get(self, request):
        form, error = JsonParser(
            Argument('app_id', type=int, required=False)
        ).parse(request.GET, True)
        app_id=form.app_id
        relatedTs = Execrelatetemplate.objects.filter(app_id=app_id)
        print('--------------')
        print(relatedTs)
        response = []
        for relatedT in relatedTs:
            app_names = App.objects.filter(sort_id=relatedT.app_id).values_list('name', flat=True)
            template_names = ExecTemplate.objects.filter(id=relatedT.template_id).values_list('name', flat=True)
            response.append({
            'app_name': ', '.join(app_names) if app_names else None,
            'template_name': ', '.join(template_names) if template_names else None
        })
        print('--------------')
        print(response)
        return json_response(response)
    
    @auth('exec.relatedTemp.add|exec.relatedTemp.edit')
    def post(self, request):
        data = json.loads(request.body)
        print(data)

        # 获取请求数据
        app_id = data['app_id']
        template_id = data['template_id']

        # 检查数据库中是否已经存在相同的记录
        exists = Execrelatetemplate.objects.filter(app_id=app_id, template_id=template_id).exists()

        if exists:
            # 如果记录已经存在，返回一个响应，表示不添加新的记录
            return json_response({'outputs': 'already_exists'})
        else:
            # 如果记录不存在，创建新的 Execrelatetemplate 实例并保存
            new_entry = Execrelatetemplate(app_id=app_id, template_id=template_id)
            new_entry.save()
            return json_response({'outputs': 'success'})

    
    @auth('exec.relatedTemp.del')
    def delete(self, request):
        app_name = request.GET.get('app_name')
        template_name = request.GET.get('template_name')
        print(app_name, template_name)
        # 创建新的 Execrelateconfig 实例并保存
        app_id = App.objects.filter(name=app_name).first().sort_id
        template_id = ExecTemplate.objects.filter(name=template_name).first().id
        entry = Execrelatetemplate.objects.filter(app_id=app_id, template_id=template_id).first()
        entry.delete()
        return json_response({'outputs': 'success'})
        
class RelatedConfigView(View):
    @auth('exec.relatedConfig.view')
    def get(self, request):
        form, error = JsonParser(
            Argument('app_id', type=int, required=False)
        ).parse(request.GET, True)
        app_id = form.app_id
        related_configs = Execrelateconfig.objects.filter(app_id=app_id)
        response = []
        for related_config in related_configs:
            app_names = App.objects.filter(sort_id=related_config.app_id).values_list('name', flat=True)
            config_version_names = ExecConfig.objects.filter(id=related_config.config_id).values_list('version_num', flat=True)
            config_names = ExecConfig.objects.filter(id=related_config.config_id).values_list('name', flat=True)
            response.append({
                'app_name': ', '.join(app_names) if app_names else None,
                'version_name': ', '.join(config_version_names) if config_version_names else None,
                'config_name': ', '.join(config_names) if config_names else None,
            })
        return json_response(response)

    @auth('exec.relatedConfig.add|exec.relatedConfig.edit')
    def post(self, request):
        data = json.loads(request.body)
        print(data)

        # 获取请求数据
        app_id = data['app_id']
        config_id = data['config_id']

        # 检查数据库中是否已经存在相同的记录
        exists = Execrelateconfig.objects.filter(app_id=app_id, config_id=config_id).exists()

        if exists:
            # 如果记录已经存在，返回一个响应，表示不添加新的记录
            return json_response({'outputs': 'already_exists'})
        else:
            # 如果记录不存在，创建新的 Execrelateconfig 实例并保存
            new_entry = Execrelateconfig(app_id=app_id, config_id=config_id)
            new_entry.save()
            return json_response({'outputs': 'success'})

    @auth('exec.relatedConfig.del')
    def delete(self, request):
        app_name = request.GET.get('app_name')
        config_name = request.GET.get('config_name')
        version_name = request.GET.get('version_name')
        print(app_name, config_name, version_name)

        # 获取对应的 app_id, config_id
        app_id = App.objects.filter(name=app_name).first().sort_id
        config_id = ExecConfig.objects.filter(name=config_name, version_num=version_name).first().id

        # 查找并删除相应的记录
        entry = Execrelateconfig.objects.filter(app_id=app_id, config_id=config_id).first()
        entry.delete()
        return json_response({'outputs': 'success'})

    

class ConfigView(View):
    @auth('exec.config.view')
    def get(self, request):
        configs = ExecConfig.objects.all()
        return json_response({'data': [x.to_view() for x in configs], 'error': None})
    
    @auth('exec.config.add|exec.config.edit')
    def post(self, request):
        form, error = JsonParser(
            Argument('id', type=int, required=False),
            Argument('name', help='请输入配置文件模版名称'),
            Argument('version_num', help='请输入配置文件模版版本号'),
            Argument('body', help='请输入配置文件模版内容'),
            Argument('interpreter', default='json'),
            Argument('host_ids', type=list, handler=json.dumps, default=[]),
            Argument('desc', required=False)
        ).parse(request.body)
        if error is None:
            if form.id:
                form.updated_at = human_datetime()
                form.updated_by = request.user
                ExecConfig.objects.filter(pk=form.pop('id')).update(**form)
            else:
                form.created_by = request.user
                ExecConfig.objects.create(**form)
        return json_response(error=error)

    @auth('exec.config.del')
    def delete(self, request):
        form, error = JsonParser(
            Argument('id', type=int, help='请指定操作对象')
        ).parse(request.GET)
        if error is None:
            ExecConfig.objects.filter(pk=form.id).delete()
            Execrelateconfig.objects.filter(config_id = form.id).delete()
        return json_response(error=error)


class TaskView(View):
    @auth('exec.task.do')
    def get(self, request):
        records = ExecHistory.objects.filter(user=request.user).select_related('template')
        return json_response([x.to_view() for x in records])

    @auth('exec.task.do')
    def post(self, request):
        form, error = JsonParser(
            Argument('host_ids', type=list, filter=lambda x: len(x), help='请选择执行主机'),
            Argument('app_id', help='请输入应用ID'),
        ).parse(request.body)
        
        if error is None:
            # 检查用户是否有权限访问主机
            if not has_host_perm(request.user, form.host_ids):
                return json_response(error='无权访问主机，请联系管理员')
            
            # 根据app_id获取关联的模板ID列表
            template_ids = Execrelatetemplate.objects.filter(app_id=form.app_id).values_list('template_id', flat=True)
            if not template_ids:
                return json_response(error='无效的应用ID，未找到关联的模板')

            # 根据template_ids获取模板信息
            templates = ExecTemplate.objects.filter(id__in=template_ids)
            if not templates.exists():
                return json_response(error='未找到关联的模板详细信息')

            # 生成token并获取Redis连接
            token, rds = uuid.uuid4().hex, get_redis_connection()
            form.host_ids.sort()

            # 遍历关联的模板并存储到ExecHistory中
            for template in templates:
                ExecHistory.objects.create(
                    app_id = form.app_id,
                    user=request.user,
                    digest=token,
                    interpreter=template.interpreter,
                    template_id=template.id,
                    command=template.body,  # 使用模板的body字段作为命令
                    host_ids=json.dumps(form.host_ids),
                    params=template.parameters  # 使用模板的parameters字段作为参数
                )
            
            return json_response(token)
        
        return json_response(error=error)


    @auth('exec.task.do')
    def patch(self, request):
        form, error = JsonParser(
            Argument('token', help='参数错误'),
            Argument('cols', type=int, required=False),
            Argument('rows', type=int, required=False)
        ).parse(request.body)

        LOG_DIR = "/data/"

        if error is None:
            term = None
            if form.cols and form.rows:
                term = {'width': form.cols, 'height': form.rows}

            rds = get_redis_connection()
            tasks = ExecHistory.objects.filter(digest=form.token)

            if not tasks.exists():
                return json_response(error='未找到与此token关联的任务')

            executed_commands = set()  # 用于跟踪已经执行的主机和模板组合

            for task in tasks:
                # 获取与任务关联的所有脚本模板
                template_ids = Execrelatetemplate.objects.filter(app_id=task.app_id).values_list('template_id', flat=True)
                templates = ExecTemplate.objects.filter(id__in=template_ids)

                if not templates.exists():
                    return json_response(error='未找到关联的模板详细信息')

                # 获取与任务关联的所有配置文件模板
                config_ids = Execrelateconfig.objects.filter(app_id=task.app_id).values_list('config_id', flat=True)
                configs = ExecConfig.objects.filter(id__in=config_ids)

                if not configs.exists():
                    return json_response(error='未找到关联的配置文件详细信息')

                for host in Host.objects.filter(id__in=json.loads(task.host_ids)):
                     with host.get_ssh() as ssh:
                        for config in configs:
                            # 生成文件内容（YAML 或 JSON）
                            if config.interpreter == 'json':
                                config_content = json.dumps(json.loads(config.body))
                                file_extension = 'json'
                            elif config.interpreter == 'yaml':
                                config_content = config.body  # Assuming it's already in YAML format
                                file_extension = 'yaml'
                            else:
                                config_content = config.body
                                file_extension = ''

                            # 将文件内容写入目标路径
                            # 将文件内容写入目标路径
                            if file_extension:
                                target_path = f"{config.desc}.{file_extension}"
                            else:
                                target_path = config.desc  # Use original desc if no extension
                            print('-----', config_content, '--------', target_path)
                            command = f"echo '{config_content}' > {target_path}"
                            ssh.exec_command(command)
                            

                for host in Host.objects.filter(id__in=json.loads(task.host_ids)):
                    for template in templates:
                        # 创建主机和模板组合的唯一键
                        command_key = (host.id, template.id)

                        if command_key in executed_commands:
                            # 如果已经执行过这个组合，跳过
                            continue

                        # 记录这个组合，防止重复执行
                        executed_commands.add(command_key)

                        data = dict(
                            key=host.id,
                            name=host.name,
                            token=task.digest,
                            interpreter=template.interpreter,  # 使用模板的解释器
                            hostname=host.hostname,
                            port=host.port,
                            username=host.username,
                            command=template.body,  # 使用模板的命令
                            pkey=host.private_key,
                            params=json.loads(template.parameters),  # 使用模板的参数
                            term=term
                        )
                        rds.rpush(settings.EXEC_WORKER_KEY, json.dumps(data))

                        # 生成日志信息
                        log_message = f"""
                        Node: {host.name}
                        Command: {template.body}
                        Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
                        """
                        # 日志文件路径
                        log_file_path = os.path.join(LOG_DIR, f"{host.name}({host.hostname}:{host.port})_execution_log.txt")
                        # 将日志信息写入文件
                        with open(log_file_path, "a") as log_file:
                            log_file.write(log_message)

                    

            return json_response(error=None)
        
        return json_response(error=error)


LOG_DIR = "/data/"

class backinfoView(View):
    @auth('exec.backinfo.saveinfo')
    def post(self,request):
        try:
            data = json.loads(request.body)
            print(data)
            node_name = data['nodeName']
            result = data['result']
            # 确保日志目录存在
            if not os.path.exists(LOG_DIR):
                os.makedirs(LOG_DIR)
            # 日志文件路径
            log_file_path = os.path.join(LOG_DIR, f"{node_name}_execution_log.txt")
            # 将结果信息写入文件
            with open(log_file_path, "a") as log_file:
                log_file.write(f"Result: {result}\n")
            return JsonResponse({'status': 'success'}, status=200)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=599)

class SaveLogView(View):
    def post(self, request):
        try:
            log_content = request.POST.get('log')
            if not log_content:
                return JsonResponse({'status': 'error', 'message': 'Log content is missing'}, status=400)

            node_name = request.POST.get('node_name', 'default_node')  # 从 POST 请求中获取节点名
            log_file_path = os.path.join(LOG_DIR, f"{node_name}_execution_log.txt")

            with open(log_file_path, "w") as log_file:
                log_file.write(log_content)

            return JsonResponse({'status': 'success'}, status=200)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
        
class NodeMessageView(View):
    def get(self, request):
        hosts = Host.objects.all() # 获取所有Host对象
        nodes_info = []   # 存储节点信息的列表
        for node in hosts: # 遍历每个Host对象
            node_info = {
                'name': node.name,
                'ip': node.port,  # 假设Host模型有id字段
                'hostname': node.hostname,  # 假设Host模型有hostname字段
                # 根据实际需要添加更多字段
            }
            nodes_info.append(node_info)
        
        # 返回标准化的JSON响应
        return JsonResponse({'data': nodes_info, 'error': None}, safe=False)
    
class NodeLogView(View):
    def get(self, request, node_id):
        log_file_path = os.path.join(LOG_DIR, f"{node_id}_execution_log.txt")
        if os.path.exists(log_file_path):
            with open(log_file_path, 'r', encoding='utf-8') as log_file:
                log_content = log_file.read()
            return JsonResponse({'status': 'success', 'data': log_content})
        else:
            return JsonResponse({'status': 'error', 'message': 'Log file not found'}, status=404)
        
class TransConfigView(View):
    @auth('exec.transconfig.do')
    def post(self, request):
        data = json.loads(request.body)
        print(data)
        form, error = JsonParser(
            Argument('config_id', type=int, help='请选择配置项'),
            Argument('dst_dir', help='请输入目标路径'),
        ).parse(data)
        if error is None:
            config = ExecConfig.objects.get(id=form.config_id)
            host_ids = json.loads(config.host_ids)

            if not has_host_perm(request.user, host_ids):
                return json_response(error='无权访问主机，请联系管理员')

            token = uuid.uuid4().hex
            # 生成脚本文件
            script_path = os.path.join(form.dst_dir, f'{config.version_num}_{config.name}.{config.interpreter}')
            with open(script_path, 'w') as f:
                f.write(config.body)

            # 生成的脚本文件路径
            print(f"脚本文件已生成：{script_path}")

            return json_response(token)
        return json_response(error=error)
