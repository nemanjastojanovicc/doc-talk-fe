module.exports = (plop) => {
  plop.setGenerator('component', {
    description: 'Create a component',
    // User input prompts provided as arguments to the template
    prompts: [
      {
        // Raw text input
        type: 'input',
        // Variable name for this input
        name: 'name',
        // Prompt to display on command line
        message: 'What is your component name?',
      },
      {
        // Raw text input
        type: 'input',
        // Variable name for this input
        name: 'container',
        // Prompt to display on command line
        message: 'Where to put your component?(path starts from "src/")',
      },
      {
        type: 'list',
        name: 'componentType',
        message: 'What is your component?',
        choices: ['Component', 'Page'],
      },
    ],
    actions: (data) => {
      const path = 'src/' + (data.container + '/') || 'components/';

      return [
        {
          // Add a new file
          type: 'add',
          // Path for the new file
          path:
            path +
            `{{pascalCase name}}/{{pascalCase name}}.${data.componentType.toLowerCase()}.tsx`,
          // Handlebars template used to generate content of new file
          templateFile: 'plop-templates/Component/Component.ts.hbs',
        },
        {
          type: 'add',
          path: path + '{{pascalCase name}}/index.ts',
          templateFile: 'plop-templates/Component/index.ts.hbs',
        },
        {
          type: 'add',
          path: path + '{{pascalCase name}}/{{pascalCase name}}.styles.scss',
          templateFile: 'plop-templates/Component/Component.scss.hbs',
        },
        {
          type: 'add',
          path:
            path +
            '{{pascalCase name}}/{{pascalCase name}}.styles.responsive.scss',
          templateFile:
            'plop-templates/Component/Component.responsive.scss.hbs',
        },
      ];
    },
  });

  plop.setGenerator('context', {
    description: 'Create a context/provider',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'What is your context name?',
      },
      {
        type: 'input',
        name: 'container',
        message: 'Where to put your context/provider?(path starts from "src/")',
      },
    ],
    actions: (data) => {
      const path = 'src/' + (data.container + '/') || 'providers/';

      return [
        {
          type: 'add',
          path: path + `{{pascalCase name}}/{{pascalCase name}}.context.ts`,
          templateFile: 'plop-templates/Context/Context.context.ts.hbs',
        },
        {
          type: 'add',
          path: path + `{{pascalCase name}}/{{pascalCase name}}.provider.tsx`,
          templateFile: 'plop-templates/Context/Context.provider.tsx.hbs',
        },
        {
          type: 'add',
          path: path + '{{pascalCase name}}/index.ts',
          templateFile: 'plop-templates/Context/index.ts.hbs',
        },
      ];
    },
  });

  plop.setGenerator('context', {
    description: 'Create a context/provider',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'What is your context name?',
      },
      {
        type: 'input',
        name: 'container',
        message: 'Where to put your context/provider?(path starts from "src/")',
      },
    ],
    actions: (data) => {
      const path = 'src/' + (data.container + '/') || 'providers/';

      return [
        {
          type: 'add',
          path: path + `{{pascalCase name}}/{{pascalCase name}}.context.ts`,
          templateFile: 'plop-templates/Context/Context.context.ts.hbs',
        },
        {
          type: 'add',
          path: path + `{{pascalCase name}}/{{pascalCase name}}.provider.tsx`,
          templateFile: 'plop-templates/Context/Context.provider.tsx.hbs',
        },
        {
          type: 'add',
          path: path + '{{pascalCase name}}/index.ts',
          templateFile: 'plop-templates/Context/index.ts.hbs',
        },
      ];
    },
  });

  plop.setGenerator('hook', {
    description: 'Create a hook',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'What is your hook name?',
      },
      {
        type: 'input',
        name: 'container',
        message: 'Where to put your hook?(path starts from "src/")',
      },
    ],
    actions: (data) => {
      const path = 'src/' + (data.container + '/') || 'providers/';

      return [
        {
          type: 'add',
          path: path + `use{{pascalCase name}}.ts`,
          templateFile: 'plop-templates/hook/hook.ts.hbs',
        },
      ];
    },
  });

  plop.setGenerator('router', {
    description: 'Create a router',
    // User input prompts provided as arguments to the template
    prompts: [
      {
        // Raw text input
        type: 'input',
        // Variable name for this input
        name: 'name',
        // Prompt to display on command line
        message: 'What is your router name?',
      },
      {
        // Raw text input
        type: 'input',
        // Variable name for this input
        name: 'container',
        // Prompt to display on command line
        message: 'Where to put your router?(path starts from "src/routers")',
      },
    ],
    actions: (data) => {
      const path = `src/routers/${data.container}/`;

      const {
        name: [firstChar, ...rest],
      } = data;
      const pascalName = [firstChar.toUpperCase(), ...rest].join('');
      return [
        {
          // Add a new file
          type: 'add',
          // Path for the new file
          path: path + `{{pascalCase name}}/{{pascalCase name}}.router.tsx`,
          // Handlebars template used to generate content of new file
          templateFile: 'plop-templates/Router/Router.tsx.hbs',
        },
        {
          type: 'add',
          path: path + '{{pascalCase name}}/index.ts',
          templateFile: 'plop-templates/Router/index.ts.hbs',
        },
        {
          // Add a new file
          type: 'add',
          // Path for the new file
          path:
            path +
            `{{pascalCase name}}/pages/{{pascalCase name}}/{{pascalCase name}}.page.tsx`,
          // Handlebars template used to generate content of new file
          templateFile: 'plop-templates/Component/Component.ts.hbs',
        },
        {
          type: 'add',
          path: path + '{{pascalCase name}}/pages/{{pascalCase name}}/index.ts',
          templateFile: 'plop-templates/Component/index.ts.hbs',
        },
        {
          type: 'add',
          path:
            path +
            '{{pascalCase name}}/pages/{{pascalCase name}}/{{pascalCase name}}.styles.scss',
          templateFile: 'plop-templates/Component/Component.scss.hbs',
        },
        {
          type: 'modify',
          path: 'src/App.tsx',
          pattern: /([ \t]*)(<Route path="\*" .+)/gi,
          template: `$1<Route path="{{#if container}}/{{lowerCase container}}{{/if}}/{{lowerCase name}}" component={${pascalName}Router}/>\n$1$2`,
        },
        {
          type: 'modify',
          path: 'src/App.tsx',
          pattern: /((import.*\n*)*)(import.*)/i,
          template: `$1$3\nimport ${pascalName}Router from 'routers/${
            data.container ? `${data.container}/` : ''
          }${pascalName}';\n`,
        },
      ];
    },
  });
};
