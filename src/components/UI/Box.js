import styled from 'styled-components'
import { space, width, color, flex, flexDirection, alignItems, alignSelf, justifyContent, justifySelf, flexWrap } from 'styled-system'

export const Box = styled.div`
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
