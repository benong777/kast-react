function TextInputWithLabel({
  elementId,
  labelText,
  ref,
  value,
  onChange
}) {
  return (
  <label htmlFor={elementId}>{labelText}
    <input
      type='text'
      ref={ref}
      id={elementId}
      value={value}
      onChange={onChange}
    />
  </label>
  )
}

export default TextInputWithLabel;