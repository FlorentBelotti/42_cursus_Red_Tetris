import { KeyboardPromptView, type KeyboardPromptState } from '../ui/keyboard_prompt_view';

export type HostStartButtonViewProps = {
  readonly text: string;
  readonly state: KeyboardPromptState;
};

export function HostStartButtonView(props: HostStartButtonViewProps): JSX.Element {
  return <KeyboardPromptView text={props.text} state={props.state} cursor={props.state === 'active'} />;
}
