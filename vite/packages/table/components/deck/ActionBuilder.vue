<template>
  <div v-for="action in actions" :class="{active:isActive(action.name)}" :style="{'border-left-color':group.color}"
       class="action" @click="setActive(action)">
    {{ action.title }}
  </div>
  <div v-for="action in actions">

    <div v-if="this.isActive(action.name)">
      <div v-if="action.summary" class="line" v-html="action.summary">
      </div>
      <template v-for="input in action.inputs">
        <div v-if="getShow(action,input,'input')" class="line">{{ input.title }}：
          <a-input v-model:value="action.data[input.name]" :placeholder="input.placeholder"
                   :style="{width: input.width}"></a-input>
        </div>
        <div v-if="getShow(action,input,'switch')" class="line">{{ input.title }}：
          <a-switch v-model:checked="action.data[input.name]"></a-switch>
        </div>
        <div v-if="getShow(action,input,'radio')" class="line">{{ input.title }}：
          <a-radio-group v-model:value="action.data[input.name]">
            <a-radio v-for="option in input.options" :value="option.value">{{ option.name }}</a-radio>
          </a-radio-group>
        </div>

        <div v-if="getShow(action,input,'file')" class="line">{{ input.title }}：
          <a-input v-model:value="action.data[input.name]" :placeholder="input.placeholder" style="width: 15em"
                   @click="showOpenFileDialog(action,input)"></a-input>
        </div>
        <template v-if="getShow(action,input,'textarea')" class="line">
          <div class="line">
            {{ input.title }}：
          </div>
          <div class="line">
            <a-textarea v-model:value="action.data[input.name]" :placeholder="input.placeholder"></a-textarea>
          </div>
        </template>

      </template>
    </div>
  </div>
</template>

<script>
import Template from '../../../user/pages/Template.vue'
import _ from 'lodash-es'
import { message } from 'ant-design-vue'

export default {
  name: 'ActionBuilder',
  components: { Template },
  props: ['actions', 'group'],
  data () {
    return {
      current: '',
      currentAction: {},
    }
  },
  mounted () {
    this.current = this.actions[0].name
    this.actions.forEach(action => {
      action.data = action.defaultValue
      if (!action.data) {
        action.data = {}
      }
    })
  },
  methods: {
    setActionData (data) {
      this.current = data.name
      let action = this.actions.find(ac => {
        return ac.name === this.current
      })
      action.data = _.cloneDeep(data.args)
    },
    getActionData () {
      let actionData = {}
      let action
      action = this.actions.find(ac => {
        return ac.name === this.current
      })
      let validate = this.validate(action)
      if (!validate.pass) {
        message.error(validate.message)
        return null
      }
      actionData = {
        action: action,
        group: this.group,
        name: action.name,
        args: _.cloneDeep(action.data)
      }
      return actionData
    },
    validate (action) {
      let message = ''
      if (!action.inputs) {
        //如果没有任何输入的直接返回成功即可
        return {
          pass: true
        }
      }
      let notPass = action.inputs.some(input => {
        if (input.rules) {
          return input.rules.some(rule => {
            if (Object.keys(rule).indexOf('required') > -1) {
              //如果是要校验require的
              if (typeof (action.data[input.name]) === 'undefined' || action.data[input.name].trim() === '') {
                message = rule.message
                return true
              }
            }
          })
        }
      })
      if (notPass) {
        return {
          pass: false,
          message: message
        }
      } else {
        return {
          pass: true
        }
      }
    },
    getShow (action, input, type) {
      let assign = true
      if (input.assign) {
        let conditions = Object.keys(input.assign)
        let hasFalse = conditions.some(key => {
          if (action.data[key] !== input.assign[key]) {
            return true
          }
        })
        assign = !hasFalse
      }
      return input.type === type && assign
    },
    isActive (key) {
      return this.current === key
    },
    setActive (action) {
      this.current = action.name
      this.currentAction = action
    },
    async showOpenFileDialog (action, input) {
      let savePath = await tsbApi.dialog.showOpenDialog({
        title: '选择', message: '请选择文件', properties: [
          'openFile ',
        ]
      })
      if (savePath) {
        action.data[input.name] = savePath[0]
      } else {
      }
    }
  }
}
</script>

<style>
.action {
  font-size: 0.9em;
}
</style>
