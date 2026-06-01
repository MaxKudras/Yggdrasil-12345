import { Plugin, PluginSettingTab } from 'obsidian';
import { GraphView, ToggleComponent } from 'obsidian-dataview';

export default class CirclePlugin extends Plugin {
  private graph: GraphView | null = null; // initialize the graph variable to null

  async onload() {
    console.log('Circle Plugin loaded');

    this.addCommand({
      id: 'add-circle',
      name: 'Add Circle',
      callback: () => {
        const activeLeaf = this.app.workspace.activeLeaf;
        if (!activeLeaf) return;

        this.graph = activeLeaf.view as GraphView | null; // set the graph variable to null or GraphView instance
        if (!this.graph || !(this.graph instanceof GraphView)) return;

        this.graph.addNode({ label: 'Circle', shape: 'circle' }); // use the graph variable to add a node
      },
    });

    this.addSettingTab(new CircleSettingTab(this.app, this));

    this.registerEvent(
      this.app.workspace.on('graph:render', (graph: GraphView) => {
        this.graph = graph || null; // set the graph variable to null or GraphView instance
        if (!this.graph || !(this.graph instanceof GraphView)) return;

        const circleToggle = new ToggleComponent(this.graph, 'circle', 'Show Circle');
        circleToggle.setValue(this.settings.showCircle);
        circleToggle.onChange((value) => {
          this.settings.showCircle = value;
          this.saveData(this.settings);
          this.graph.redraw();
        });
        this.graph.addSettingToggle(circleToggle);
      })
    );
  }

  onunload() {
    console.log('Circle Plugin unloaded');
  }
}

class CircleSettingTab extends PluginSettingTab {
  constructor(app: any, plugin: any) {
    super(app, plugin);
  }

  display() {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Circle Settings' });

    const showCircleSetting = new ToggleComponent(containerEl, '', 'Show Circle');
    showCircleSetting.setValue(this.plugin.settings.showCircle);
    showCircleSetting.onChange((value) => {
      this.plugin.settings.showCircle = value;
      this.plugin.saveData(this.plugin.settings);
    });

    containerEl.createEl('div', { text: 'Note: Changes will be applied after reloading the graph view.' });
  }

  async init() {
    this.containerEl = this.createDiv();
    this.display();
  }

  onClose() {
    this.containerEl.empty();
  }
}
