import styled from 'styled-components/macro';
import { darken, rgba } from 'polished';

export const Button = styled.a`
  background-color: ${p=>p.theme.primary};
  color: #fff;
  display:${p=>p.block ? 'block' : 'inline-block'};
  ${p=>p.block && `
    width: 100%;
    text-align: center;
  `}

  line-height: 1;
	padding: ${p=>p.sm ? '6px 10px' : p.lg ? '18px 20px' : '15px 12px'};
	border-radius: 5px;
	cursor: pointer;
	border: none;
	box-shadow: 0px 1px 5px ${rgba('#000', .3)};
  text-decoration: none;
  ${p=>p.lg && `
    font-size: 2em;
    font-weight: 300;
  `}

	&:hover, &:focus, &:active {
		background: ${p=>darken(.05, p.theme.primary)};
		outline: none;
	}
`;
