declare module 'vuetify/styles' {
  const styles: string;
  export default styles;
}

declare module 'vuetify/components' {
  import type { Plugin } from 'vue';
  const components: Record<string, any>;
  export = components;
}

declare module 'vuetify/directives' {
  const directives: Record<string, any>;
  export = directives;
}

declare module 'vuedraggable' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<any, any, any>;
  export default component;
}
