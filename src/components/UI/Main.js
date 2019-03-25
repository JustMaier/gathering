import styled from 'styled-components/macro';
import { math } from 'polished';

export const Main = styled.main`
  padding-top: ${p=>math(`${p.theme.gutter} + 45px`)};
`;
