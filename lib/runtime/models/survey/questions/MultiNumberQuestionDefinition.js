import cuid from 'cuid';
import { List } from 'immutable';
import BaseQuestionDefinition from './internal/BaseQuestionDefinition';
import OutputDefinition from './internal/OutputDefinition';
import ItemDefinition from './internal/ItemDefinition';
import ValidationErrorDefinition from '../../ValidationErrorDefinition';
import surveyDevIdGeneratorInstance from '../../../SurveyDevIdGenerator';

/** 設問定義：数値記入 */
export default class MultiNumberQuestionDefinition extends BaseQuestionDefinition {
  static create(pageDevId) {
    const questionDevId = surveyDevIdGeneratorInstance.generateForQuestion(pageDevId);
    const itemDevId = surveyDevIdGeneratorInstance.generateForItem(questionDevId);
    return new MultiNumberQuestionDefinition({
      _id: cuid(),
      devId: questionDevId,
      dataType: 'MultiNumber',
      items: List().push(ItemDefinition.create(itemDevId, 0)),
    });
  }

  /** 出力に使用する名前を取得する */
  getOutputName(index) {
    return `${this.getId()}__value${index + 1}`;
  }

  /** 追加出力に使用する名前を取得する */
  getAdditionalOutputName(index) {
    return `${this.getId()}__text${index + 1}`;
  }

  /** 合計の出力に使用する名前を取得する */
  getTotalOutputName() {
    return `${this.getId()}__total`;
  }

  getOutputDefinitionOfAdditionalInputFromItem(item, pageNo = '0', questionNo = '0') {
    return new OutputDefinition({
      _id: `${item.getId()}__text`,
      questionId: this.getId(),
      name: this.getAdditionalOutputName(item.getIndex()),
      devId: `${item.getDevId()}_text`,
      label: `${item.getPlainLabel()}-入力欄`,
      dlLabel: `${this.getPlainTitle()}-${item.getPlainLabel()}-入力欄`,
      question: this,
      outputType: item.getAdditionalInputType(),
      outputNo: BaseQuestionDefinition.createOutputNo(pageNo, questionNo, item.getIndex() + 1, 'text'),
    });
  }

  /** itemからoutputDefinitionを取得する */
  getOutputDefinitionFromItem(item, pageNo = '0', questionNo = '0') {
    const name = this.getOutputName(item.getIndex());
    return new OutputDefinition({
      _id: item.getId(),
      questionId: this.getId(),
      devId: item.getDevId(),
      name,
      label: `${item.getPlainLabel()}`,
      dlLabel: `${this.getPlainTitle()}-${item.getPlainLabel()}`,
      question: this,
      outputType: 'number',
      outputNo: BaseQuestionDefinition.createOutputNo(pageNo, questionNo, item.getIndex() + 1),
    });
  }

  getOutputDefinitionOfTotal(pageNo = '0', questionNo = '0') {
    const name = this.getTotalOutputName();
    return new OutputDefinition({
      _id: name, // totalは入れ替えが無いのでidとnameが同一で問題ない
      questionId: this.getId(),
      devId: `${this.getDevId()}_total`,
      name,
      label: `${this.getPlainTitle()}-合計値`,
      dlLabel: `${this.getPlainTitle()}-合計値`,
      question: this,
      outputType: 'number',
      outputNo: BaseQuestionDefinition.createOutputNo(pageNo, questionNo, 'total'),
      downloadable: false,
    });
  }

  getOutputDefinitionsFromItem(item, pageNo = '0', questionNo = '0') {
    const outputDefinitionOfItem = this.getOutputDefinitionFromItem(item, pageNo, questionNo);
    // 追加入力分
    if (item.hasAdditionalInput()) {
      return List.of(outputDefinitionOfItem, this.getOutputDefinitionOfAdditionalInputFromItem(item, pageNo, questionNo));
    }
    return List.of(outputDefinitionOfItem);
  }

  /** 追加入力のOutputDefinitionのみを取得する */
  getOutputDefinitionsOfAdditionlInput(pageNo = '0', questionNo = '0') {
    return this.getItems()
      .filter(item => item.hasAdditionalInput())
      .map(item => this.getOutputDefinitionOfAdditionalInputFromItem(item, pageNo, questionNo));
  }

  /** 設問が出力する項目の一覧を返す */
  getOutputDefinitions(pageNo = '0', questionNo = '0') {
    const outputDefinitions = this.getItems().flatMap(item => this.getOutputDefinitionsFromItem(item, pageNo, questionNo));
    // 合計値
    if (this.showTotal) {
      return outputDefinitions.push(this.getOutputDefinitionOfTotal(pageNo, questionNo));
    }

    return outputDefinitions;
  }

  findOutputDefinitionFromName(pageNo, questionNo, name) {
    return this.getOutputDefinitions(pageNo, questionNo).find(od => od.getName() === name);
  }

  /** 正しく設定されているかチェックする */
  validate(survey) {
    let errors = super.validate(survey);
    const page = survey.findPageFromQuestion(this.getId());
    const node = survey.findNodeFromRefId(page.getId());

    const replacer = survey.getReplacer();
    const outputDefinitions = survey.findPrecedingOutputDefinition(node.getId());
    if (!replacer.validate(this.getItems().map(item => item.getLabel()).join(''), outputDefinitions)) errors = errors.push('選択肢で存在しない参照があります');

    this.getItems().forEach((item) => {
      const itemErrors = item.validate(survey, node, page, this)
        .map(itemError => new ValidationErrorDefinition({ type: itemError.getType(), message: `項目${item.getIndex() + 1} ${itemError.getMessage()}` }));
      itemErrors.forEach((error) => { errors = errors.push(error); });
    });
    return errors;
  }
}
