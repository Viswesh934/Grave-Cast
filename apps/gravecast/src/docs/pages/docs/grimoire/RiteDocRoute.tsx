import type { ComponentType } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { GRIMOIRE_PATH } from './paths';
import { RITE_DOCS } from './registry';

/** Shows a rite's docs page, or sends unknown ids back to the overview. */
export function RiteDocRoute() {
  const { riteId = '' } = useParams();
  const Doc = (RITE_DOCS as Record<string, ComponentType | undefined>)[riteId];
  return Doc ? <Doc key={riteId} /> : <Navigate to={GRIMOIRE_PATH} replace />;
}
