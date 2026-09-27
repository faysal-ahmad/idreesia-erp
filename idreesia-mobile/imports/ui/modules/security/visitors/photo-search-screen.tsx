import React, { useState } from 'react';
import { Button, List, Tag, Toast } from 'antd-mobile';
import { CameraOutline } from 'antd-mobile-icons';
import { useApolloClient } from '@apollo/client/react';
import { ImageVectorStatus } from 'meteor/idreesia-common/constants';

import { getErrorMessage } from '../../../auth/accounts';
import { Page, PageEmpty, PageError, PageLoading } from '../../../layout';
import { capturePhoto } from '../../../utilities';
import { SecurityPaths } from '../paths';
import {
  MOBILE_SECURITY_FACE_VECTOR_FROM_IMAGE,
  MOBILE_SECURITY_VISITORS_BY_FACE_VECTOR,
} from './gql';
import { type VisitorListRecord, VisitorListItem } from './visitor-list-item';

const MATCH_LIMIT = 5;

// Same wording as the web's search-by-picture dialog: every unusable-photo
// status tells the user what to change about the next photo.
const StatusMessages: Record<string, string> = {
  [ImageVectorStatus.NO_FACE]: 'No face was detected in this photo.',
  [ImageVectorStatus.MULTIPLE_FACES]:
    'More than one face in this photo. Retake with only the visitor in frame.',
  [ImageVectorStatus.TOO_SMALL]: 'The face is too small. Move closer and retake.',
  [ImageVectorStatus.ERROR]: 'This photo could not be processed. Try another.',
};

interface Match {
  score: number;
  visitor: VisitorListRecord;
}

type SearchState =
  | { step: 'idle' }
  | { step: 'searching'; photo: string }
  | { step: 'unusable'; photo: string; message: string }
  | { step: 'failed'; photo: string; error: unknown }
  | { step: 'done'; photo: string; matches: Match[] };

/** Security → Visitors → Search by photo. */
export const PhotoSearchScreen = () => {
  const client = useApolloClient();
  const [state, setState] = useState<SearchState>({ step: 'idle' });

  const search = async (photo: string) => {
    setState({ step: 'searching', photo });
    try {
      const { data } = await client.query({
        query: MOBILE_SECURITY_FACE_VECTOR_FROM_IMAGE,
        variables: { imageData: photo },
        fetchPolicy: 'no-cache',
      });
      const result = data?.securityFaceVectorFromImage;
      if (result?.status !== ImageVectorStatus.COMPUTED || !result.vector) {
        const status = result?.status ?? ImageVectorStatus.ERROR;
        setState({
          step: 'unusable',
          photo,
          message: StatusMessages[status] ?? StatusMessages[ImageVectorStatus.ERROR],
        });
        return;
      }

      const { data: matchData } = await client.query({
        query: MOBILE_SECURITY_VISITORS_BY_FACE_VECTOR,
        variables: { vector: result.vector, limit: MATCH_LIMIT },
        fetchPolicy: 'no-cache',
      });
      // Already ordered best-first by the server, which also drops weak matches.
      const matches = (matchData?.securityVisitorsByFaceVector ?? []).flatMap(match =>
        match?.person?._id ? [{ score: match.score ?? 0, visitor: match.person }] : []
      );
      setState({ step: 'done', photo, matches });
    } catch (error) {
      setState({ step: 'failed', photo, error });
    }
  };

  const takePhoto = async () => {
    try {
      const photo = await capturePhoto();
      if (photo) await search(photo);
    } catch (error) {
      Toast.show({ icon: 'fail', content: getErrorMessage(error, 'Could not open the camera.') });
    }
  };

  if (state.step === 'idle') {
    return (
      <Page backTo={SecurityPaths.visitors} title="Search by photo">
        <PageEmpty
          action={
            <Button color="primary" size="large" onClick={takePhoto}>
              <CameraOutline /> Take photo
            </Button>
          }
          description="Take a clear, front-facing photo of the visitor's face. The photo is only used for this search and isn't saved."
          icon={<CameraOutline />}
          title="Find a visitor by their photo"
        />
      </Page>
    );
  }

  let results;
  if (state.step === 'searching') {
    results = <PageLoading />;
  } else if (state.step === 'unusable') {
    results = <p className="photo-search-problem">{state.message}</p>;
  } else if (state.step === 'failed') {
    results = <PageError error={state.error} onRetry={() => search(state.photo)} />;
  } else if (state.matches.length === 0) {
    results = (
      <PageEmpty
        description="Nobody registered looks like this photo. Try a clearer photo, or search by name or CNIC."
        title="No matching visitor found"
      />
    );
  } else {
    results = (
      <List header="Closest matches" mode="card">
        {state.matches.map(({ score, visitor }) => (
          <VisitorListItem
            key={visitor._id}
            extra={
              <Tag color="primary" fill="outline">
                {Math.round(score * 100)}% match
              </Tag>
            }
            visitor={visitor}
          />
        ))}
      </List>
    );
  }

  return (
    <Page
      backTo={SecurityPaths.visitors}
      footer={
        <Button
          block
          color="primary"
          disabled={state.step === 'searching'}
          size="large"
          onClick={takePhoto}
        >
          <CameraOutline /> Retake photo
        </Button>
      }
      title="Search by photo"
    >
      <div className="photo-search-preview">
        <img alt="Visitor being searched for" src={state.photo} />
      </div>
      {results}
    </Page>
  );
};
