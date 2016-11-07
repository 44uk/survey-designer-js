import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import update from 'react/lib/update';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import TinyMCE from 'react-tinymce';
import { DragSource, DropTarget } from 'react-dnd';
import CheckboxEditor from './question_editor/CheckboxEditor';
import { Well, Panel, Glyphicon, Form, FormGroup, ControlLabel, Grid, Col, Row } from 'react-bootstrap';
import * as EditorActions from '../actions'
import * as RuntimeActions from '../../runtime/actions'
import * as Utils from '../../utils'
import * as Validator from '../validator'

class ConditionEditor extends Component {
  constructor(props) {
    super(props);
  }

  handleClickAddButton(ccIndex, e) {
    const { handleChangeBranch, index } = this.props;
    const condition = this.getCondition();
    condition.childConditions.splice(ccIndex, 0, {
      refQuestionId: '',
      operator : '==',
      value: ''
    });

    handleChangeBranch(index, condition);
  }

  handleClickMinusButton(ccIndex, e) {
    const { handleChangeBranch, index } = this.props;
    const condition = this.getCondition();
    condition.childConditions.splice(ccIndex, 1);
    handleChangeBranch(index, condition);
  }

  handleChange() {
    const { handleChangeBranch, index } = this.props;
    const type = this.refs.conditionType.value;
    const nextFlowId = this.refs.conditionNextFlowId.value;

    handleChangeBranch(index, this.getCondition());
  }

  getCondition() {
    const root = ReactDOM.findDOMNode(this);
    const type = this.refs.conditionType.value;
    const nextFlowId = this.refs.conditionNextFlowId.value;
    const refIdElements= root.querySelectorAll('.condition-ref-id');
    const refValueElements = root.querySelectorAll('.condition-ref-value');
    const refOperatorElements = root.querySelectorAll('.condition-ref-operator');
    const childConditions = Array.prototype.slice.apply(refIdElements).map((el, i) => {
      return {
        refQuestionId: refIdElements[i].value,
        operator: refOperatorElements[i].value,
        value: refValueElements[i].value
      };
    });
    const condition = { type, nextFlowId, childConditions };
    this.validateCondition(condition);
    return condition;
  }

  validateCondition(nextCondition) {
    const { state, condition } = this.props;
    const validationState = {
      isNextFlowIdValid: !!Utils.findFlow(state, nextCondition.nextFlowId),
      isChildConditionsValid: nextCondition.childConditions.map(cc => !!Utils.findQuestionByStr(state, cc.refQuestionId))
    };
    if (!validationState.isNextFlowIdValid || !validationState.isChildConditionsValid.some(s => !s)) {
      this.setState(validationState);
      return false;
    }
  }

  renderChildCondition(childCondition, index, childConditions) {
    return (
      <div key={`child-conditions-${index}`} className="condition-editor">
        <input type="text" className="form-control condition-ref-id" placeholder="質問ID" value={childCondition.refQuestionId} onChange={this.handleChange.bind(this)}/>
        <span>の値が</span>
        <input type="text" className="form-control condition-ref-value" placeholder="値" value={childCondition.value} onChange={this.handleChange.bind(this)}/>
        <select className="form-control condition-ref-operator" value={childCondition.operator} onChange={this.handleChange.bind(this)}>
          <option value=">=">以上</option>
          <option value="==">と等しい</option>
          <option value="<=">以下</option>
          <option value=">">より大きい</option>
          <option value="<">より小さい</option>
          <option value="includes">の選択肢を選択している</option>
          <option value="notIncludes">の選択肢を選択していない</option>
        </select>
        <Glyphicon className="clickable icon-button text-info" glyph="plus-sign" onClick={this.handleClickAddButton.bind(this, index)}/>
        { childConditions.length === 1 ? null : <Glyphicon className="clickable icon-button text-danger" glyph="minus-sign" onClick={this.handleClickMinusButton.bind(this, index)}/> }
      </div>
    );
  }

  renderNotLast() {
    const { condition, isDragging, index } = this.props;
    const opacity = isDragging ? 0 : 1;
    return (
      <Well className="branch-editor" style={{opacity}}>
        <div className="branch-editor-header">
          <span>以下の</span>
          <select ref="conditionType" className="form-control condition-type" value={condition.type} onChange={this.handleChange.bind(this)}>
            <option value="all">全て</option>
            <option value="any">いずれか</option>
          </select>
          <span>を満たす場合</span>
          <input ref="conditionNextFlowId" type="text" className="form-control condition-next-flow-id" value={condition.nextFlowId} readOnly={true}/>
          <span>に遷移する</span>
        </div>
        <div className="branch-editor-body">
          {condition.childConditions.map((cc, i, childConditions) => this.renderChildCondition(cc, i, childConditions))}
        </div>
      </Well>
    );
  }

  renderLast() {
    const { condition, isDragging, index } = this.props;
    const opacity = isDragging ? 0 : 1;
    return (
      <Well className="branch-editor" style={{opacity}}>
        <div className="branch-editor-header">
          <span>上記以外の場合</span>
          <input ref="conditionNextFlowId" type="text" className="form-control condition-next-flow-id" value={condition.nextFlowId} readOnly={true}/>
          <span>に遷移する</span>
        </div>
      </Well>
    );
  }

  render() {
    const { condition, isLast, isDragging, connectDragSource, connectDropTarget } = this.props;
    return connectDragSource(connectDropTarget(<div>{isLast ? this.renderLast() : this.renderNotLast()}</div>))
  }
}

const conditionSource = {
  beginDrag(props) {
    return {
      id: props.nextFlowId,
      index: props.index
    };
  }
};

const conditionTarget = {
  hover(props, monitor, component) {
    const dragIndex = monitor.getItem().index;
    const hoverIndex = props.index;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }

    // Determine rectangle on screen
    const hoverBoundingRect = ReactDOM.findDOMNode(component).getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return;
    }

    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return;
    }

    // Time to actually perform the action
    //console.log(dragIndex, hoverIndex);
    props.handleMoveCondition(dragIndex, hoverIndex);

    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex;
  }
};

const stateToProps = state => ({
  state: state
});
const actionsToProps = dispatch => ({
});

ConditionEditor = DropTarget('CONDITION', conditionTarget, (connect) => ({ connectDropTarget: connect.dropTarget() }))(ConditionEditor);
ConditionEditor = DragSource('CONDITION', conditionSource, (connect, monitor) => ({ connectDragSource: connect.dragSource(), isDragging: monitor.isDragging() }))(ConditionEditor);
ConditionEditor = connect(stateToProps, actionsToProps)(ConditionEditor);
export default ConditionEditor;