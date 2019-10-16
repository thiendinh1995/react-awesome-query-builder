import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import map from "lodash/map";
import { getFieldConfig } from "../../utils/configUtils";
import { calcTextWidth } from "../../utils/stuff";
import { Select, Spin } from "antd";
const Option = Select.Option;
import shallowCompare from "react-addons-shallow-compare";

export default class ConstantWidget extends Component {
  static propTypes = {
    setValue: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    field: PropTypes.string.isRequired,
    value: PropTypes.string, //key in listValues
    customProps: PropTypes.object
  };

  shouldComponentUpdate = shallowCompare;

  handleChange = val => {
    this.props.setValue(val);
  };

  filterOption = (input, option) => {
    return (
      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
    );
  };

  render() {
    // const {  data } = this.state;

    let size = this.props.config.settings.renderSize || "small";
    let placeholder = this.props.placeholder || "Select option";
    const fieldDefinition = getFieldConfig(this.props.field, this.props.config);
    console.log("this.props.field: ", this.props);
    const { data } = this.props.config;
    let listConstant = [];
    if (data && data.constant && data.constant.length >= 0) {
      listConstant = data.constant;
    }
    const options = map(listConstant, value => {
      return (
        <Option key={value.key} value={value.value}>
          {value.name}
        </Option>
      );
    });
    let placeholderWidth = calcTextWidth(placeholder, "14px");
    let customProps = this.props.customProps || {};
    // console.log(this.state);

    return (
      <Select
        style={{ width: this.props.value ? null : placeholderWidth + 48 }}
        key={"widget-select"}
        dropdownMatchSelectWidth={false}
        ref="val"
        placeholder={placeholder}
        size={size}
        value={this.props.value || undefined} //note: (bug?) null forces placeholder to hide
        onChange={this.handleChange}
        filterOption={this.filterOption}
        {...customProps}
      >
        {options}
      </Select>
    );
  }
}
