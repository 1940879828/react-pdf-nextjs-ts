import React, {PropsWithChildren} from "react";
import classNames from "classnames";
import styles from "./index.module.css"

type Props = {
  type?: "orange" | "dark"
  shape?: "circle" | "square"
  text?: string
  onClick?: () => void
  disabled?: boolean
}
const Index:React.FC<PropsWithChildren<Props>> = (props) => {
  const {type="orange", shape="square", text, onClick, children, disabled} = props

  const _onClick = () => {
    onClick?.()
  }

  return (
    <div onClick={_onClick} className={classNames(styles.button,styles[type],styles[shape],{[styles.disable]:disabled})}>
      {text}
      {children && children}
    </div>
  )
}

export default Index