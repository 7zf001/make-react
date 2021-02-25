/**
 * React.createElement
 * @param {string} type 
 * @param {object} props 
 * @param  {...any} children 
 */
function createElement(type, props, ...children) {
  return {
      type,
      props: {
          ...props,
          children
      }
  }
}

module.exports = createElement