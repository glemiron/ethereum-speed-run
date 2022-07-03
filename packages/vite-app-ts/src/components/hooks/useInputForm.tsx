import { CheckSquareTwoTone } from '@ant-design/icons';
import { Input, Row } from 'antd';
import { ReactElement, useState } from 'react';

type Props = {
  label: string;
  submitIcon?: ReactElement;
  onSubmit: (value: string) => Promise<void>;
  isUncontrolled?: boolean;
};

export const useInputForm = ({ onSubmit, submitIcon, isUncontrolled, label }: Props) => {
  const [value, setValue] = useState<string>('');
  const [inProgress, setInProgress] = useState(false);

  const onFinish = async () => {
    setInProgress(true);
    await onSubmit(value);
    setInProgress(false);
  };

  const element = (
    <Row>
      {label}
      <Input
        disabled={inProgress}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        addonAfter={
          <div className={'space-x-2'}>
            <div
              title={'Add 18 zeros'}
              className={'inline-block cursor-pointer'}
              onClick={() => value && setValue((parseFloat(value) * 10 ** 18).toString())}>
              ✳️
            </div>

            <CheckSquareTwoTone title={'Submit!'} onClick={() => onFinish()} />
          </div>
        }
      />
    </Row>
  );

  return {
    value,
    element,
  };
};
