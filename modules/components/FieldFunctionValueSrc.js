import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';
import last from 'lodash/last';
import keys from 'lodash/keys';
import clone from 'clone';

import {
    getFieldConfig,
    getWidgetForFieldOp,
} from '../utils/configUtils';
import { truncateString, } from '../utils/stuff';


const { Option, OptGroup } = Select;
const FieldFunctionValueSrc = (props) => {
    const {
        handleChangeValue,
        config, field,
        operator, valueSelected,
        dataTypeOfParam,
    } = props;

    const buildSelectItems = (fields, path = null) => {
        let fieldSeparator = config.settings.fieldSeparator;
        let maxLabelsLength = config.settings.maxLabelsLength || 100;
        if (!fields)
            return null;
        let prefix = path ? path.join(fieldSeparator) + fieldSeparator : '';

        return keys(fields).map(fieldKey => {
            let field = fields[fieldKey];
            let label = field.label || last(fieldKey.split(fieldSeparator));
            label = truncateString(label, maxLabelsLength);
            if (field.type == "!struct") {
                let subpath = (path ? path : []).concat(fieldKey);
                return <OptGroup
                    key={prefix + fieldKey}
                    label={label}
                >
                    {buildSelectItems(field.subfields, subpath)}
                </OptGroup>
            } else {
                return <Option
                    key={prefix + fieldKey}
                    value={prefix + fieldKey}
                >
                    {label}
                </Option>;
            }
        });
    }

    const filterFields = (config, fields, leftFieldFullkey, operator) => {
        fields = clone(fields);
        const fieldSeparator = config.settings.fieldSeparator;
        const leftFieldConfig = getFieldConfig(leftFieldFullkey, config);
        let expectedType;
        let widget = getWidgetForFieldOp(config, leftFieldFullkey, operator, 'value');
        if (widget) {
            let widgetConfig = config.widgets[widget];
            let widgetType = widgetConfig.type;
            //expectedType = leftFieldConfig.type;
            expectedType = widgetType;
        } else {
            expectedType = leftFieldConfig.type;
        }
        function _filter(list, path) {
            for (let rightFieldKey in list) {
                let subfields = list[rightFieldKey].subfields;
                let subpath = (path ? path : []).concat(rightFieldKey);
                let rightFieldFullkey = subpath.join(fieldSeparator);
                let rightFieldConfig = getFieldConfig(rightFieldFullkey, config);
                if (rightFieldConfig.type == "!struct") {
                    _filter(subfields, subpath);
                } else {
                    let canUse = rightFieldConfig.type == dataTypeOfParam && rightFieldFullkey != leftFieldFullkey;
                    let fn = config.settings.canCompareFieldWithField;
                    if (fn)
                        canUse = canUse && fn(leftFieldFullkey, leftFieldConfig, rightFieldFullkey, rightFieldConfig);
                    if (!canUse)
                        delete list[rightFieldKey];
                }
            }
        }

        _filter(fields, []);

        return fields;
    }

    let fieldOptions = filterFields(config, config.fields, field, operator);
    let placeholder = config.settings.fieldPlaceholder;
    let buildSelectOptionItems = buildSelectItems(fieldOptions);

    return (
        <div className="valuesrc--function">
            <Select
                showSearch
                value={valueSelected || undefined}
                style={{ width: 200 }}
                placeholder={placeholder}
                size={config.settings.renderSize || "small"}
                onChange={handleChangeValue}
                optionFilterProp="children"
            >
                {buildSelectOptionItems}
            </Select>
        </div>
    );
}

FieldFunctionValueSrc.propsTypes = {
    handleChangeValue: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    field: PropTypes.string.isRequired,
    operator: PropTypes.string.isRequired,
    valueSelected: PropTypes.string,
    dataTypeOfParam: PropTypes.string.isRequired,
};

FieldFunctionValueSrc.defaultProps = {
    valueSelected: '',
};

export default FieldFunctionValueSrc;