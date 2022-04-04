export const bgStyle = (hover) => {
  return {
    height: '50px',
    width: '200px',
    borderRadius: '20px',
    border: 'none',
    backgroundColor: '#4caf50',
    textDecoration: 'none',

    ...(hover && {
      backgroundColor: '#212121'
    })
  }
}

export const imgStyle = {
  float: 'left',
  marginLeft: '5px',
  marginTop: '5px',
  height: '40px',
  width: '40px'
}

export const textStyle = (hover) => {
  return {
    float: 'right',
    marginTop: '5px',
    marginRight: '10px',
    color: '#212121',
    fontSize: '24px',

    ...(hover && {
      color: '#4caf50'
    })
  }
}