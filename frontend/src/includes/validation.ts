import {
  Form as VeeForm,
  Field as VeeField,
  defineRule,
  ErrorMessage,
  configure
} from 'vee-validate'

import {
  required,
  min,
  max,
  alpha_spaces as alphaSpaces,
  confirmed,
  numeric
} from '@vee-validate/rules'

export default {
  install(app: any) {
    app.component('VeeForm', VeeForm)
    app.component('VeeField', VeeField)
    app.component('ErrorMessage', ErrorMessage)

    defineRule('required', required)
    defineRule('min', min)
    defineRule('max', max)
    defineRule('alpha_spaces', alphaSpaces)
    defineRule('password_mismatch', confirmed)
    defineRule('numeric', numeric)

    configure({
      generateMessage: (ctx) => {
        const messages: any = {
          required: `The ${ctx.field} field is required.`,
          min: `The ${ctx.field} is too short.`,
          max: `The ${ctx.field} is too long.`,
          alpha_spaces: `The ${ctx.field} field may only contain alpha characters and spaces.`,
          password_mismatch: `The passwords don't match.`,
          numeric: `The ${ctx.field} field may only contain numeric characters.`
        }

        if (!ctx.rule) return `The ${ctx.field} field is invalid`
        const message: any = messages[ctx.rule.name]
          ? messages[ctx.rule.name]
          : `The field ${ctx.field} is invalid`

        return message
      },
      validateOnBlur: false,
      validateOnChange: false,
      validateOnInput: false,
      validateOnModelUpdate: true
    })
  }
}
