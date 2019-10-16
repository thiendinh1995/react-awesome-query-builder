import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Select,
  InputNumber,
  Input,
  Radio,
  Popover,
  Icon,
  Switch,
  DatePicker
} from 'antd';
import last from 'lodash/last';
import keys from 'lodash/keys';
import clone from 'clone';
import moment from 'moment';

import {
  getFieldConfig,
  getValueSourcesForFieldOp,
} from '../../utils/configUtils';
import { truncateString, } from '../../utils/stuff';
import FieldFunctionValueSrc from '../FieldFunctionValueSrc';
import FieldConstantValueSrc from '../FieldConstantValueSrc';
import { DATA_TYPE, VALUE_SOURCE_FUNCTION, } from '../../constants';

const { Option, } = Select;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;


export default class ValueFunction extends Component {
  static propTypes = {
    setValue: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    field: PropTypes.string.isRequired,
    value: PropTypes.object,
    operator: PropTypes.string,
    customProps: PropTypes.object,
  };

  /**
   * @key key function
   * Handle change select
   */
  handleFieldSelect = (key) => {
    this.renderFunctionParams(this.props.config.functions[key]);
    this.props.setValue({ parameters: [], functionSelected: key, valueSrc: [] });
  }

  /**
   * @functions info of functions (type, key, params,...)
   * Render list function in select
   */
  buildOptionItems = (functions, path = null) => {
    const functionSeparator = this.props.config.settings.fieldSeparator;
    const maxLabelsLength = this.props.config.settings.maxLabelsLength || 100;
    const prefix = path ? path.join(functionSeparator) + functionSeparator : '';

    if (!functions) { return null; }

    return keys(functions).map(functionKey => {
      const functionSelect = functions[functionKey];
      let label = functionSelect.functionName || last(functionKey.split(functionSeparator));
      label = truncateString(label, maxLabelsLength);
      return (
        <Option
          key={prefix + functions[functionKey].key}
          value={prefix + functions[functionKey].key}
        >
          {label}
        </Option>
      );
    });
  }

  /**
   * @value onchange field input
   * @index position of field input
   * @dataType data type of field input
   */
  handleChange = (value, index, dataType) => {
    let valueChange = value;
    const valueFunctionSelect = clone(this.props.value);
    if (dataType === DATA_TYPE.TEXT) { valueChange = value.target.value; }
    if (dataType === DATA_TYPE.DATE) { valueChange = value.toISOString(); }
    valueFunctionSelect.parameters[index] = valueChange;
    this.props.setValue({ ...valueFunctionSelect });
  }

  /**
   * @value value of group button
   * @index position of popover
   * Handle change popover value source
   */
  handleChangePopover = ({ target }, index) => {
    const valueFunctionSelect = clone(this.props.value);
    valueFunctionSelect.valueSrc[index] = target.value;
    valueFunctionSelect.parameters[index] = '';
    this.props.setValue({ ...valueFunctionSelect });
  }

  /**
   * @index position of radio group button
   * Render popover
   */
  renderValueSources = (index) => {
    const { config, field, operator, value, } = this.props;
    const valueSourcesInfo = config.settings.valueSourcesInfo;
    const valueSourcesPopupTitle = config.settings.valueSourcesPopupTitle;
    const valueSources = getValueSourcesForFieldOp(config, field, operator);

    let valueSrc = (value && value.valueSrc && value.valueSrc[index]) || null;
    if (!valueSources) { return null; }

    let content = (
      <RadioGroup
        value={valueSrc || "value"}
        size={this.props.config.settings.renderSize || "small"}
        onChange={(value) => this.handleChangePopover(value, index)}
      >
        {valueSources.filter((valueSource) => valueSource !== 'function').map(srcKey => (
          <RadioButton
            key={srcKey}
            value={srcKey}
          >{valueSourcesInfo[srcKey].label}
          </RadioButton>
        ))}
      </RadioGroup>
    );

    return (
      <Popover
        className="popover-function"
        title={valueSourcesPopupTitle}
        content={content}
      >
        <Icon type="ellipsis" />
      </Popover>
    );
  }

  /**
   * @index position index of params, valueSrc
   * @dataTypeOfParam data type of param
   * Render control antd by valueSrc
   */
  renderValueSourceParam = (index, dataTypeOfParam) => {
    const { config, value, operator, field, } = this.props;
    const valueSource = value && value.valueSrc[index] || 'value';

    switch (valueSource) {
      case VALUE_SOURCE_FUNCTION.FIELD:
        return (
          <FieldFunctionValueSrc
            value={value}
            field={field}
            config={config}
            operator={operator}
            dataTypeOfParam={dataTypeOfParam}
            valueSelected={this.props.value.parameters[index]}
            handleChangeValue={(value) => this.handleChange(value, index, VALUE_SOURCE_FUNCTION.FIELD)}
          />
        );
      case VALUE_SOURCE_FUNCTION.CONSTANT:
        return (
          <FieldConstantValueSrc
            config={config}
            value={this.props.value.parameters[index]}
            handleChangeValueConstant={(value) => this.handleChange(value, index, VALUE_SOURCE_FUNCTION.CONSTANT)}
          />
        );
      case VALUE_SOURCE_FUNCTION.VALUE:
        return this.filterUIForValueSource(dataTypeOfParam, index);
      default:
        return this.filterUIForValueSource(dataTypeOfParam, index);
    }
  }

  /**
   * @dataType Data type of parameter
   * @index Position of parameter
   * Return UI of parameter
   */
  filterUIForValueSource = (dataType, index) => {
    switch (dataType) {
      case DATA_TYPE.TEXT:
        return (
          <Input
            value={this.props.value && this.props.value.parameters[index] || ''}
            size={this.props.config.settings.renderSize || "small"}
            onChange={(value) => this.handleChange(value, index, dataType)}
            style={{ marginLeft: '8px', width: '134px' }} />
        );
      case DATA_TYPE.NUMBER:
        return (
          <InputNumber
            key={index}
            value={this.props.value && this.props.value.parameters[index] || 0}
            size={this.props.config.settings.renderSize || "small"}
            onChange={(value) => this.handleChange(value, index, dataType)}
            style={{ marginLeft: '8px' }} />
        );
      case DATA_TYPE.BOOL:
        return (
          <Switch
            value={this.props.value && this.props.value.parameters[index] || false}
            defaultChecked
            style={{ marginLeft: '8px' }}
            onChange={(value) => this.handleChange(value, index, dataType)}
          />
        );
      case DATA_TYPE.DATE:
        return (
          <DatePicker
            style={{ marginLeft: '8px' }}
            value={this.props.value && moment(this.props.value.parameters[index]) || undefined}
            onChange={(value) => this.handleChange(value, index, dataType)}
          />
        );
      default:
        return (
          <Input
            value={this.props.value && this.props.value.parameters[index] || ''}
            size={this.props.config.settings.renderSize || "small"}
            onChange={(value) => this.handleChange(value, index, dataType)}
            style={{ marginLeft: '8px', width: '134px' }} />
        );
    }
  }


  renderFunctionParams = (functionSelected) => {
    if (!functionSelected) { return; }
    const { key, params, } = functionSelected;

    return params.map((dataTypeOfParam, index) => (
      <div className="widget--function" key={key + '--' + index}>
        {this.renderValueSources(index)}
        {this.renderValueSourceParam(index, dataTypeOfParam)}
      </div>
    ));
  }

  /**
   * @config in file config
   * @leftFieldFullkey info of field
   * @operator operator of field
   * Filter function by type
   */
  filterFunctions = (config, leftFieldFullkey) => {
    const leftFieldConfig = getFieldConfig(leftFieldFullkey, config);
    const { functions } = config;

    // Get functions of field config
    const { type } = leftFieldConfig;
    const functionsOfField = Object.keys(functions).map(key => {
      return functions[key].type === type ? functions[key] : undefined;
    }).filter(func => func);

    if (!functionsOfField.length) { return [] };
    return functionsOfField;
  }

  /**
   * @input value search
   * @option element select
   */
  filterOption = (input, option) => {
    return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  }

  /**
   * @functionKey key of function selected
   * @config info in file config
   */
  getFunctionInit = (functionKey, config) => {
    const { functions } = config;
    const result = functions[functionKey] ? functions[functionKey] : null;
    const renderParams = this.renderFunctionParams(result);
    return renderParams;
  }

  /**
   * Render select functions
   */
  renderAsSelect = () => {
    const { value, config, field, operator, } = this.props;
    const placeholder = this.props.config.settings.functionPlaceholder;
    let fieldOptions = this.filterFunctions(config, field);
    const customProps = this.props.customProps || {};
    const buildOptionItems = this.buildOptionItems(fieldOptions);
    const initParamsInput = this.props.value && this.getFunctionInit(value.functionSelected, config);

    return (
      <div className="widget--valuesrc--function">
        <Select
          value={value && value.functionSelected || undefined}
          style={{ width: '200px' }}
          ref="function"
          placeholder={placeholder}
          size={this.props.config.settings.renderSize || "small"}
          onChange={this.handleFieldSelect}
          filterOption={this.filterOption}
          {...customProps}
        >
          {buildOptionItems}
        </Select>
        {initParamsInput}
      </div>
    );
  }

  render() {
    return this.renderAsSelect();
  }
}
