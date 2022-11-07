export class Component {
  constructor (tag, props) {
    this.tag = tag;
    this.props = props;
  }
}

export class Action {
  constructor(name, tag1, props1, tag2, props2) {
    this.name = name;
    this.componentLeft = new Component(tag1, props1);
    this.componentRight = new Component(tag2, props2);
  }
}