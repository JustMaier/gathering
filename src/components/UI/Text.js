import styled, { css } from 'styled-components/macro'
import { space, fontSize, fontWeight, lineHeight, color, textAlign, themeGet as _ } from 'styled-system'

export const Text = styled.p`
  ${space}
  ${fontSize}
  ${fontWeight}
  ${lineHeight}
  ${color}
  ${textAlign}
  ${p => p.allCaps && css`
    text-transform:uppercase;
  `}
`
Text.propTypes = {
  ...space.propTypes,
  ...fontSize.propTypes,
  ...fontWeight.propTypes,
  ...lineHeight.propTypes,
  ...color.propTypes,
  ...textAlign.propTypes
}
Text.defaultProps = {
  m: 0
}

export const Header = styled(Text.withComponent('h1'))`
  letter-spacing: -0.03em;
  text-shadow: 1px 2px 3px ${_('colors.textShadow')};
`
Header.defaultProps = {
  fontSize: 5,
  fontWeight: 600,
  lineHeight: 1.17,
  m: 0,
  color: 'header'
}
