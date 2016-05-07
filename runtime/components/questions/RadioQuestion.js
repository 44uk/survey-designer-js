import React, { Component, PropTypes } from 'react'
import { errorMessage, isString, r } from '../../../utils'

export default class RadioQuestion extends Component {
  constructor(props) {
    super(props);
  }
  makeItems() {
    const { id, choices, vertical, inputValues } = this.props;
    if (!choices) {
      return errorMessage('choices attribute is not defined');
    }
    const labelClassName = `radio-label ${vertical ? 'vertical' : 'horizontal'}`;
    const style = { marginBottom: 16 };
    return choices.map((label, i) => {
      const obj = { label: '', value: i + 1 };
      if (isString(label)) {
        obj.label = label;
      } else {
        Object.assign(obj, label);
      }
      return <label className={labelClassName}>
        <input type="radio" name={id} value={obj.value}/>
        <span dangerouslySetInnerHTML={{__html: r(obj.label, inputValues)}}/>
      </label>;
    });
  }
  render() {
    return (
      <div className={this.constructor.name}>
        {this.makeItems()}
      </div>
    );
  }
}

RadioQuestion.defaultProps = {
  inputValues: [],
  vertical: true
};

RadioQuestion.propTypes = {
  type: PropTypes.string.isRequired,
  choices: PropTypes.array.isRequired,
  vertical: PropTypes.bool.isRequired,
};
