import fs from 'fs';
import path from 'path';

const PLUGINS_BASE_DIR = path.join(process.cwd(), '../plugins');

/**
 * Load plugins from disk and validate them.
 * Plugins must be:
 * - in the /plugins/<plugin-name> directory
 * - contain an ai-plugin.json file as per OpenAI spec https://platform.openai.com/docs/plugins/getting-started/plugin-manifest
 * - contain an openapi.yaml file as per OpenAPI spec https://swagger.io/specification/ (not validated right now)
 * 
 * @returns Array of GPTPlugin objects
 */
export async function getPlugins(): Promise<GPTPlugin[]> {
  const plugins: GPTPlugin[] = [];

  // Look for directories under /plugins - each directory must contain a ai-plugin.json file and an openapi.yaml file
  const pluginBaseDirContents = fs.readdirSync(PLUGINS_BASE_DIR);
  console.log("\n=== LOADING PLUGINS FROM:", PLUGINS_BASE_DIR);

  // Filter out anything that's not a directory
  const pluginDirs = pluginBaseDirContents.filter((pluginName) => {
    const pluginPath = path.join(PLUGINS_BASE_DIR, pluginName);
    return fs.statSync(pluginPath).isDirectory();
  });

  // Validate the plugin files in each directory
  await Promise.all(pluginDirs.map(async (pluginDir) => {
    try {
      // attempt to load the ai-plugin.json file
      const pluginConfigData = fs.readFileSync(path.join(PLUGINS_BASE_DIR, pluginDir, 'ai-plugin.json'), 'utf-8');
      const pluginConfig: AIPluginSpec = JSON.parse(pluginConfigData);
     
      // Look for openapi.yaml or openapi.json file and read in as string
      const openapiSpecPathYaml = path.join(PLUGINS_BASE_DIR, pluginDir, 'openapi.yaml');
      const openapiSpecPathJson = path.join(PLUGINS_BASE_DIR, pluginDir, 'openapi.json');
      let openApiSpecData;
      try {
        openApiSpecData = fs.readFileSync(openapiSpecPathYaml, 'utf-8');
      } catch (error) {
        try {
          openApiSpecData = fs.readFileSync(openapiSpecPathJson, 'utf-8');
        } catch (error) {
          console.error(`Error loading openapi.yaml or openapi.json for plugin ${pluginDir}.`);
          return;
        }
      }

      // TODO: validate the openapi.yaml file -- right now it is validate in the Langchain code when called

      const newPlugin = {
        name: pluginConfig.name_for_human,
        aiPlugin: pluginConfig,
        openApiSpec: openApiSpecData
      };

      // Add the validated plugin to the list of plugins
      plugins.push(newPlugin);
      console.log("=== ADDED PLUGIN:", newPlugin.name, "from", PLUGINS_BASE_DIR + "/" + pluginDir);

    } catch (error) {
      // Non-breaking... Log and ignore invalid plugins
      console.error(`Error loading plugin "${PLUGINS_BASE_DIR}/${pluginDir}" verify that ai-plugin.json and openapi.yaml exist are valid.`);
    }
  }));

  return plugins;
}


// Define a type that contains all the info for an OpenAI plugin
export type GPTPlugin = {
  name: string;           
  aiPlugin: AIPluginSpec; 
  openApiSpec: string;       
}

// Define a type that contains all the info for an OpenAI plugin (ai-plugin.json)
export interface AIPluginSpec {
  schema_version: string;
  name_for_human: string;
  name_for_model: string;
  description_for_human: string;
  description_for_model: string;
  // TODO: accept different auth types
  auth: {
    type: string;
  };
  api: {
    type: string;
    url: string;
  };
  logo_url: string;
  contact_email: string;
  legal_info_url: string;
}