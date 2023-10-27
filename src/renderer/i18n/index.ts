import {computed, ComputedRef, ref} from "vue";

export const GlobalLanguage = ref('zh-cn')

// 加载已有的语言包资源
export const loadLanguages = (): any => {
  const context: any = import.meta.glob("./languages/*.ts", {eager: true});

  const languages: any = {};

  let langs = Object.keys(context);
  for (let key of langs) {
      if (key === "./users.ts") return;
    let lang = context[key].lang;
    let name = key.replace(/(\.\/languages\/|\.ts)/g, '');
    languages[name] = lang
  }

  return languages
}

// TODO 改成vue3-18n@next【vue3版本】
export const i18nt: ComputedRef = computed(() => {
  const lang = loadLanguages()
  return lang[GlobalLanguage.value]
})

export const setLanguage = (locale: string): void => {
  GlobalLanguage.value = locale
}
