# Copyright: (c) OpenSpug Organization. https://github.com/openspug/spug
# Copyright: (c) <spug.dev@gmail.com>
# Released under the AGPL-3.0 License.
from django.db import models
from libs import ModelMixin, human_datetime
import json

class Resource(models.Model, ModelMixin):
    node_name = models.CharField(max_length=50)
    ip_address = models.CharField(max_length=15, default='10.60.80.171')
    port = models.IntegerField(default='5000')
    node_placement = models.CharField(max_length=255)
    lng = models.FloatField(null=True, blank=True)  # 经度
    lat = models.FloatField(null=True, blank=True)  # 纬度

    def __repr__(self):
        return '<Resource %r>' % self.node_name
    
    class Meta:
        db_table = 'resource'
        ordering = ('-id',)