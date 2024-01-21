import fmtUnit from '/util/fmtUnit';
Component({
  props: {
    type: '',
    size: fmtUnit(17),
    color: '',
    className: ''
  },
  data: {
    valueUnit: fmtUnit('px')
  }
});