import styled from 'styled-components/macro'
import { math } from 'polished'

export const Main = styled.main`
  padding-top: ${p => math(`${p.theme.space[4]} + 45px`)};
`
