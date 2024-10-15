import React, {HTMLAttributes, PropsWithChildren, useRef, useState} from "react";
import {createPortal} from "react-dom";
import styles from "./index.module.css"
import classNames from "classnames";

type Props = {
  overlay: React.ReactNode
} & Pick<HTMLAttributes<Element>,'className' | 'style'>

const Popover: React.FC<PropsWithChildren<Props>> = (props)=> {
  const {children, overlay, className} = props
  const [visible, setVisible] = useState(false)
  const wrapper = useRef<HTMLSpanElement>(null)
  const [{left, top, width}, setRect] = useState<Partial<DOMRect>>({})
  const style = {
    top: {left: `${left}px`, top: `${top}px`, height: '0px', width: `${width}px`, justifyContent:'center', alignItems:'end'},
  }

  const show = () => {
    if (!wrapper.current) return
    const rect = wrapper.current.getBoundingClientRect()
    setRect(rect)
    setVisible(true)
  }

  const hide = () => {
    setVisible(false);
  }

  const onMouseEnter = () => {
    show()
  }

  const onMouseLeave = () => {
    hide()
  }

  return (
    <>
      <span ref={wrapper} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        {children}
      </span>
      {createPortal(
        <div className={classNames(
          styles.portal,
          {[styles.hidden]:!visible}
        )} style={{...props.style, ...style.top}}
             onMouseEnter={onMouseEnter}
             onMouseLeave={onMouseLeave}
        >
          <span className={classNames(styles.overlay, className)}
          >{overlay}</span>
        </div>, document.body
      )}
    </>
  )
}

export default Popover;