import styled from 'styled-components/macro';
import { rgba } from 'polished';

export const Header = styled.h1`
  font-size: 2.25em;
	font-weight: 600;
	margin-bottom: 0.6em;
	line-height: 1.17;
	letter-spacing: -0.03em;
	color: ${p=>p.theme.header};
	text-shadow: 1px 2px 3px ${rgba('#000',0.3)};
`;
