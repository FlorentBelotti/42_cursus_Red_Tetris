import { KeyboardPromptView, type KeyboardPromptState } from '../ui/keyboard_prompt_view';

export type HostStartButtonViewProps = {
  readonly text: string;
  readonly state: KeyboardPromptState;
};

/**
 * The Room Lobby's start-game prompt. Host sees an active prompt with a
 * cursor; a non-host sees a muted "waiting for host" prompt. The resolved
 * text/state comes from page_access/room_lobby_page_access.ts — this
 * component only renders what it's given.
 *
 * @param props - The already-resolved prompt text and visual state.
 */
export function HostStartButtonView(props: HostStartButtonViewProps): JSX.Element {
  return <KeyboardPromptView text={props.text} state={props.state} cursor={props.state === 'active'} />;
}
