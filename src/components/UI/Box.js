import styled from 'styled-components'
import { space, width, color, flex, flexDirection, alignItems, alignSelf, justifyContent, justifySelf, flexWrap, borderRadius } from 'styled-system'

export const Box = styled.div`
  ${borderRadius}
  ${space}
  ${width}
  ${color}
  ${flex}
  ${flexDirection}
  ${alignItems}
  ${alignSelf}
  ${justifyContent}
  ${justifySelf}
  ${flexWrap}
  display:flex;
`
Box.propTypes = {
  ...borderRadius.propTypes,
  ...space.propTypes,
  ...width.propTypes,
  ...color.propTypes,
  ...flex.propTypes,
  ...flexDirection.propTypes,
  ...alignItems.propTypes,
  ...alignSelf.propTypes,
  ...justifyContent.propTypes,
  ...justifySelf.propTypes,
  ...flexWrap.propTypes
}
