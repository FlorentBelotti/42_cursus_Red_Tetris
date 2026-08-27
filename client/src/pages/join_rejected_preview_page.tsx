import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ApplicationShell } from '../components/layout/application_shell';
import { KeyboardPromptView } from '../components/ui/keyboard_prompt_view';
import { JoinRejectedView } from '../components/feedback/join_rejected_view';
import { useKeyboardInputBindings, type KeyboardInputHandler } from '../hooks/use_keyboard_input_bindings';
import {
  resolveJoinRejectedReasonMessage,
  type JoinRejectedReasonCode,
} from '../mock_data/join_rejected_reason_messages';
import { JOIN_REJECTED_PAGE_KEY_LEGEND, isJoinRejectedRetryKey } from '../page_access/join_rejected_page_access';
import styles from './join_rejected_preview_page.module.css';

const VALID_REASON_CODES: readonly JoinRejectedReasonCode[] = [
  'game_already_started',
  'player_name_already_taken',
  'invalid_room_name',
];

const DEFAULT_REASON_CODE: JoinRejectedReasonCode = 'game_already_started';

/**
 * Resolves the "reason" query parameter into a valid reason code, falling
 * back to the default when missing or unrecognised.
 *
 * @param reasonQueryValue - The raw "reason" query parameter value.
 * @returns A valid JoinRejectedReasonCode.
 */
function resolveReasonCodeFromQueryParameter(reasonQueryValue: string | null): JoinRejectedReasonCode {
  const matchingReasonCode = VALID_REASON_CODES.find((reasonCode) => reasonCode === reasonQueryValue);

  if (matchingReasonCode !== undefined) {
    return matchingReasonCode;
  }

  return DEFAULT_REASON_CODE;
}

/**
 * Dev-only preview route for the Join Rejected screen
 * (`/__preview/rejected?reason=<code>`). The real trigger — a
 * `room:join_rejected` socket event — doesn't exist yet (see PROMPT.md
 * pages §5); this route exists so the screen can be reached and inspected.
 */
export function JoinRejectedPreviewPage(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reasonCode = resolveReasonCodeFromQueryParameter(searchParams.get('reason'));
  const reasonMessage = resolveJoinRejectedReasonMessage(reasonCode);

  const handleKeyDown: KeyboardInputHandler = useCallback(
    (event) => {
      if (isJoinRejectedRetryKey(event)) {
        navigate('/');
        return true;
      }

      return false;
    },
    [navigate],
  );

  useKeyboardInputBindings(handleKeyDown);

  return (
    <ApplicationShell
      room="REDROOM"
      playerName="PELICAN"
      socketStatus="LINK LOST"
      legend={JOIN_REJECTED_PAGE_KEY_LEGEND}
    >
      <div className={styles.wrapper}>
        <JoinRejectedView displayCode={reasonMessage.displayCode} explanation={reasonMessage.explanation} />
        <KeyboardPromptView text="> PRESS [ENTER] TO TRY AGAIN" state="active" cursor />
      </div>
    </ApplicationShell>
  );
}
