import * as C from '../constants'
export function initializeDefs(allDefs) {
  const str = JSON.stringify({type: C.INIT_ALL_DEFS, allDefs});
  return {
    type: C.INIT_ALL_DEFS
  };
}
export function changeDefs(defsName, defs) {
  return {
    type: C.CHANGE_DEFS,
    defsName: defsName,
    defs: defs
  };
}
/********************** Graph関連 **********************/
export function selectFlow(flowId) {
  return {
    type: C.SELECT_FLOW,
    from: C.GRAPH,
    flowId
  }
}
export function addPageFlow(x, y) {
  return { type: C.ADD_PAGE_FLOW, x, y };
}
export function clonePage(flowId, x, y) {
  return { type: C.CLONE_PAGE, flowId, x, y };
}
export function addBranchFlow(x, y) {
  return { type: C.ADD_BRANCH_FLOW, x, y };
}
export function removeFlow(flowId) {
  return { type: C.REMOVE_FLOW, flowId };
}
export function removeEdge(sourceFlowId, targetFlowId) {
  return { type: C.REMOVE_EDGE, sourceFlowId, targetFlowId };
}
export function changePosition(flowId, x, y) {
  return { type: C.CHANGE_POSITION, flowId, x, y };
}
export function changeCustomPage(customPageId, html) {
  return { type: C.CHANGE_CUSTOM_PAGE, customPageId, html };
}
export function connectFlow(sourceFlowId, dstFlowId) {
  return { type: C.CONNECT_FLOW, sourceFlowId, dstFlowId };
}
export function setElementsPosition(positions) {
  return { type: C.SET_ELEMENTS_POSITION, positions };
}

/********************** page, question関連 **********************/
export function loadState(state) {
  return { type: C.LOAD_STATE, state };
}
export function resizeGraphPane(graphWidth) {
  return { type: C.RESIZE_GRAPH_PANE, graphWidth };
}
export function resizeEditorPane(hotHeight) {
  return { type: C.RESIZE_EDITOR_PANE, hotHeight };
}
export function changeCodemirror(yaml) {
  return { type: C.CHANGE_CODEMIRROR, yaml };
}
export function changeQuestionType(questionType) {
  return { type: C.CHANGE_QUESTION_TYPE, questionType };
}
export function changeQuestionTitle(html) {
  return { type: C.CHANGE_QUESTION_TITLE, html };
}
export function changeQuestionBeforeNote(html) {
  return { type: C.CHANGE_QUESTION_BEFORE_NOTE, html };
}
export function changeQuestionAfterNote(html) {
  return { type: C.CHANGE_QUESTION_AFTER_NOTE, html };
}
export function changeQuestionChoices(choices) {
  return { type: C.CHANGE_QUESTION_CHOICES, choices };
}
export function addComponent(component) {
  return { type: C.ADD_COMPONENT, component};
}
