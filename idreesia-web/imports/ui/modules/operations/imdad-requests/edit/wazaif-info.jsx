import React from 'react';
import PropTypes from 'prop-types';
import { useQuery, useMutation } from '@apollo/react-hooks';

import { Col, Collapse, Form, Row, message } from '/imports/ui/controls';
import { AuditInfo } from '/imports/ui/modules/common';
import {
  InputNumberField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

const { Panel } = Collapse;

const formItemLayout = {
  labelCol: { span: 18 },
  wrapperCol: { span: 6 },
};

import {
  OPERATIONS_IMDAD_REQUEST_BY_ID,
  UPDATE_OPERATIONS_IMDAD_REQUEST,
  PAGED_OPERATIONS_IMDAD_REQUESTS,
} from '../gql';

const GeneralInfo = ({ requestId, form, history }) => {
  const [updateOperationsImdadRequest] = useMutation(
    UPDATE_OPERATIONS_IMDAD_REQUEST,
    {
      refetchQueries: [
        { query: PAGED_OPERATIONS_IMDAD_REQUESTS, variables: { filter: {} } },
      ],
      awaitRefetchQueries: true,
    }
  );

  const { data, loading } = useQuery(OPERATIONS_IMDAD_REQUEST_BY_ID, {
    variables: { _id: requestId },
  });

  if (loading) return null;
  const { operationsImdadRequestById } = data;
  const { isFieldsTouched } = form;

  const handleCancel = () => {
    history.goBack();
  };

  const handleSubmit = e => {
    e.preventDefault();
    form.validateFields((err, { imdadReasonId, status, notes }) => {
      if (err) return;

      updateOperationsImdadRequest({
        variables: {
          _id: requestId,
          imdadReasonId,
          status,
          notes,
        },
      })
        .then(() => {
          history.goBack();
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    });
  };

  return (
    <>
      <Form layout="horizontal" onSubmit={handleSubmit}>
        <Collapse>
          <Panel header="Wazaif Details">
            <Row type="flex">
              <Col span={10}>
                <InputNumberField
                  fieldName="01"
                  fieldLabel="کلمہ ( فی کل لمحہ )"
                  fieldLayout={formItemLayout}
                />
                <InputNumberField
                  fieldName="02"
                  fieldLabel="الله"
                  fieldLayout={formItemLayout}
                />
                <InputNumberField
                  fieldName="03"
                  fieldLabel="لا الہ الا الله"
                  fieldLayout={formItemLayout}
                />
                <InputNumberField
                  fieldName="04"
                  fieldLabel="صلی الله علیه وسلم"
                  fieldLayout={formItemLayout}
                />
              </Col>
              <Col span={10}>
                <InputNumberField
                  fieldName="05"
                  fieldLabel="استغفرالله"
                  fieldLayout={formItemLayout}
                />
                <InputNumberField
                  fieldName="06"
                  fieldLabel="آیته الکرسی"
                  fieldLayout={formItemLayout}
                />
                <InputNumberField
                  fieldName="07"
                  fieldLabel="دعا۶ تعلق"
                  fieldLayout={formItemLayout}
                />
                <InputNumberField
                  fieldName="08"
                  fieldLabel="دعا۶ وسواس"
                  fieldLayout={formItemLayout}
                />
                <InputNumberField
                  fieldName="09"
                  fieldLabel="سبحان الله وبحمده سبحان الله العظیم"
                  fieldLayout={formItemLayout}
                />
              </Col>
            </Row>
            <InputTextAreaField
              fieldName="notes"
              fieldLabel="Notes"
              initialValue={operationsImdadRequestById.notes}
            />
          </Panel>
          <Panel header="Pabandi &amp; Raabta" />
        </Collapse>

        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={operationsImdadRequestById} />
    </>
  );
};

GeneralInfo.propTypes = {
  requestId: PropTypes.string,
  history: PropTypes.object,
  match: PropTypes.object,
  location: PropTypes.object,
  form: PropTypes.object,
};

export default Form.create()(GeneralInfo);
