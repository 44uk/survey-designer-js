import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { addTodo, completeTodo, setVisibilityFilter, VisibilityFilters } from '../actions'
import Page from '../components/Page'
import { findPage, findFlow } from '../../utils'
import * as EnqueteActions from '../actions'
import { INIT_ALL_DEFS, CHANGE_DEFS, SELECT_FLOW } from '../../constants'

class EnqueteRuntuimeApp extends Component {
  componentDidMount() {
    // iframe用の処理
    if (window) {
      window.addEventListener('message', this.onMessage.bind(this), false);
    }
  }
  onMessage(e) {
    const { state, actions } = this.props;
    const action = JSON.parse(e.data);
    switch (action.type) {
      case INIT_ALL_DEFS:
        actions.initializeDefs(action.allDefs);
        break;
      case CHANGE_DEFS:
        const { defsName, defs } = JSON.parse(e.data);
        actions.changeDefs(defsName, defs);
        break;
      case SELECT_FLOW:
        const { flowId } = JSON.parse(e.data);
        actions.setFlowId(flowId);
        break;
      default:
        break;
    }
  }
  render() {
    const { state, actions } = this.props;
    const currentFlow = findFlow(state, state.values.currentFlowId);
    if (!currentFlow) return <div/>;
    const currentPage = findPage(state, currentFlow.pageId);
    return (
      <div>
        <Page page={currentPage} state={state} actions={actions}/>
      </div>
    )
  }
}

EnqueteRuntuimeApp.propTypes = {
  state: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired
}

function select(state) {
  return {state};
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(EnqueteActions, dispatch)
  }
}

export default connect(
  select,
  mapDispatchToProps
)(EnqueteRuntuimeApp)
