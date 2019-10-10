import React, { Component } from 'react';
import PropTypes from 'prop-types';
import shallowCompare from 'react-addons-shallow-compare';
import {
  getFieldConfig, getFieldPath, getFieldPathLabels, getValueSourcesForFieldOp, getWidgetForFieldOp
} from "../../utils/configUtils";
import { calcTextWidth, truncateString, BUILT_IN_PLACEMENTS } from "../../utils/stuff";
import { Menu, Dropdown, Icon, Tooltip, Button, Select, InputNumber, Input } from 'antd';
const { Option, OptGroup } = Select;
const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;
const DropdownButton = Dropdown.Button;
import range from 'lodash/range';
import last from 'lodash/last';
import keys from 'lodash/keys';
import clone from 'clone';

//tip: this.props.value - right value, this.props.field - left value

export default class ValueFunction extends Component {
  static propTypes = {
    setValue: PropTypes.func.isRequired,
    renderAsDropdown: PropTypes.bool,
    config: PropTypes.object.isRequired,
    field: PropTypes.string.isRequired,
    value: PropTypes.string,
    operator: PropTypes.string,
    customProps: PropTypes.object,
  };
  constructor(props) {
    super(props);
    this.state = {
      params: null,
      selectedValue: '',
    }
  }

  handleFieldSelect = (key) => {
    const renderParamInput = this.renderFunctionParams(this.props.config.functions[key]);
    this.setState({ params: renderParamInput, selectedValue: key });
  }

  buildOptionItem = (functions, path = null) => {
    const functionSeparator = this.props.config.settings.fieldSeparator;
    const maxLabelsLength = this.props.config.settings.maxLabelsLength || 100;
    const prefix = path ? path.join(functionSeparator) + functionSeparator : '';

    if (!functions) { return null; }

    return keys(functions).map(functionKey => {
      const functionSelect = functions[functionKey];
      let label = functionSelect.label || last(functionKey.split(functionSeparator));
      label = truncateString(label, maxLabelsLength);
      return (<Option
        key={prefix + functionKey}
        value={prefix + functionKey}
      >
        {label}
      </Option>);
    });
  }

  renderFunctionParams = (functionSelected) => {
    const { capacityParams } = functionSelected;
    switch (functionSelected.type) {
      case 'number':
        return range(0, capacityParams).map((item) => (
          <InputNumber
            size={this.props.config.settings.renderSize || "small"}
            key={'' + item}
            min={0}
            max={10000}
            style={{ marginLeft: '8px' }} />
        ));
        break;
      case 'text':
        return range(0, capacityParams).map((item) => (
          <Input
            size={this.props.config.settings.renderSize || "small"}
            key={'' + item}
            type={"text"}
            style={{ marginLeft: '8px', width: '134px' }} />
        ));
        break;
      default:
        return null;
        break;
    }
  }

  renderAsSelect = () => {
    const placeholder = this.props.config.settings.functionPlaceholder;
    const placeholderWidth = calcTextWidth(placeholder, '14px');
    const customProps = this.props.customProps || {};
    const buildOptionItem = this.buildOptionItem(this.props.config.functions);

    const functionSelect = (
      <div className="">
        <Select
          value={this.state.selectedValue}
          style={{ width: this.props.value ? null : placeholderWidth + 48 }}
          ref="function"
          placeholder={placeholder}
          size={this.props.config.settings.renderSize || "small"}
          onChange={this.handleFieldSelect}
          {...customProps}
        >
          {buildOptionItem}
        </Select>
        {this.state.params || null}
      </div>
    );

    return functionSelect;
  }

  render() {
    return this.renderAsSelect();
  }
}
