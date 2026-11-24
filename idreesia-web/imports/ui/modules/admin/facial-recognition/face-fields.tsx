import React from 'react';
import { Form, InputNumber } from 'antd';

import FieldHelp from './field-help';

export const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

interface Props {
  initialValue?: number | null;
  disabled: boolean;
  /** Where the face comes from, for the help text, e.g. "at the kiosk". */
  source: string;
  /** The default, as shown in the help popup. */
  defaultValue: string;
}

const required = (label: string) => [{ required: true, message: `Please enter ${label}.` }];

// The fields shared by every face-recognition settings tab.

export const MatchThresholdField = ({ initialValue, disabled, source, defaultValue }: Props) => (
  <Form.Item
    {...formItemLayout}
    name="matchThreshold"
    initialValue={initialValue}
    rules={required('a match threshold')}
    label={
      <FieldHelp
        label="Match threshold"
        description={`The minimum similarity (cosine, 0 to 1) between the face ${source} and a stored photo for it to count as a match.`}
        effect="Raising it makes matching stricter: fewer wrong matches, but more genuine people are told no match. Lowering it does the opposite."
        defaultValue={defaultValue}
        range="0.30 to 0.95"
      />
    }
  >
    <InputNumber min={0.3} max={0.95} step={0.01} disabled={disabled} />
  </Form.Item>
);

export const DetectionScoreField = ({ initialValue, disabled, defaultValue }: Props) => (
  <Form.Item
    {...formItemLayout}
    name="minDetectionScore"
    initialValue={initialValue}
    rules={required('a detection confidence')}
    label={
      <FieldHelp
        label="Face detection confidence"
        description="How sure the detector must be that something in the camera image is a face before it is used."
        effect="Raising it ignores unclear or partial faces (the person is asked to look at the camera again), but may also reject usable photos. Lowering it accepts weaker detections."
        defaultValue={defaultValue}
        range="0.30 to 0.99"
      />
    }
  >
    <InputNumber min={0.3} max={0.99} step={0.01} disabled={disabled} />
  </Form.Item>
);

export const MinFaceSizeField = ({ initialValue, disabled, defaultValue }: Props) => (
  <Form.Item
    {...formItemLayout}
    name="minFacePixels"
    initialValue={initialValue}
    rules={required('a minimum face size')}
    label={
      <FieldHelp
        label="Minimum face size (px)"
        description="The smallest size, in pixels, of the shorter side of the detected face. Smaller faces are rejected with 'face too small'."
        effect="Raising it makes people stand closer to the camera, which gives better matches. Lowering it accepts faces from further away, which are less reliable."
        defaultValue={defaultValue}
        range="20 to 400"
      />
    }
  >
    <InputNumber min={20} max={400} step={1} precision={0} disabled={disabled} />
  </Form.Item>
);

export const MatchMarginField = ({ initialValue, disabled, defaultValue, note }: Props & { note: string }) => (
  <Form.Item
    {...formItemLayout}
    name="minMatchMargin"
    initialValue={initialValue}
    rules={required('a minimum match margin')}
    label={
      <FieldHelp
        label="Minimum match margin"
        description="How far the best match must be ahead of the next-best different person. A close runner-up suggests a look-alike or a poor photo."
        effect="Raising it rejects more ambiguous matches, but may reject genuine matches for twins or siblings. 0 turns the check off."
        note={note}
        defaultValue={defaultValue}
        range="0 to 0.50"
      />
    }
  >
    <InputNumber min={0} max={0.5} step={0.01} disabled={disabled} />
  </Form.Item>
);

export const SharpnessField = ({ initialValue, disabled, defaultValue }: Props) => (
  <Form.Item
    {...formItemLayout}
    name="minSharpness"
    initialValue={initialValue}
    rules={required('a minimum sharpness')}
    label={
      <FieldHelp
        label="Minimum sharpness"
        description="How sharp the face must be, from 0 (smeared) to 100 (crisp). Measured on the face itself, so a sharp photo with a blurry face still fails."
        effect="Raising it rejects more blurry photos (camera shake, out of focus, motion), but may reject usable photos taken in poor light. 0 turns the check off. A blurry photo is reported as 'blurry'."
        defaultValue={defaultValue}
        range="0 to 100"
      />
    }
  >
    <InputNumber min={0} max={100} step={1} precision={0} disabled={disabled} />
  </Form.Item>
);

export const FacePoseField = ({ initialValue, disabled, defaultValue }: Props) => (
  <Form.Item
    {...formItemLayout}
    name="minFacePose"
    initialValue={initialValue}
    rules={required('a minimum frontal pose')}
    label={
      <FieldHelp
        label="Minimum frontal pose"
        description="How directly the face must look at the camera, from 0 (turned away or tilted up or down) to 100 (straight on). Worked out from the position of the eyes, nose and mouth."
        effect="Raising it requires people to look straighter at the camera, which gives better matches; lowering it accepts turned heads. 0 turns the check off. A turned face is reported as 'face turned away'."
        defaultValue={defaultValue}
        range="0 to 100"
      />
    }
  >
    <InputNumber min={0} max={100} step={1} precision={0} disabled={disabled} />
  </Form.Item>
);
