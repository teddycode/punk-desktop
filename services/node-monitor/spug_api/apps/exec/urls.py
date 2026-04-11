# Copyright: (c) OpenSpug Organization. https://github.com/openspug/spug
# Copyright: (c) <spug.dev@gmail.com>
# Released under the AGPL-3.0 License.
from django.conf.urls import url
from django.urls import path
from apps.exec.views import *
from apps.exec.transfer import TransferView

urlpatterns = [
    url(r'template/$', TemplateView.as_view()),
    url(r'do/$', TaskView.as_view()),
    url(r'transfer/$', TransferView.as_view()),
    url(r'saveinfo/$', backinfoView.as_view()),
    url(r'savelog/$', SaveLogView.as_view()),
    url(r'nodeMessage/$', NodeMessageView.as_view()),
    path('logview/<str:node_id>/', NodeLogView.as_view()),
    url(r'config/$', ConfigView.as_view()),
    url(r'transconfig/$', TransConfigView.as_view()),
    url(r'relatedtemp/$', RelatedTempView.as_view()),
    url(r'relatedconfig/$', RelatedConfigView.as_view())
]
