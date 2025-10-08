import React from 'react'
import { useActions, useValues } from 'kea'
import { counterLogic } from '../AppLogic';

import { Button, Container, Typography} from '@mui/material';

function BigButton() {
  const { increment } = useActions(counterLogic)

  return <Button onClick={increment}>Add one thousand! 🤩</Button>
}

function LittleButton() {
  const { decrement } = useActions(counterLogic)

  return <Button onClick={decrement}>Subtract one thousand! 🤩</Button>
}

function BigDisplay() {
  const { count } = useValues(counterLogic)

  return (<Typography sx={{ ':hover': { bgcolor: 'darkblue' }}}>{count}</Typography>)
}

export default function LogicDemo () {
    return (
        <Container>
            <React.Fragment>
                <BigButton/><br/>
                <LittleButton/><br/>
                <BigDisplay/><br/>
            </React.Fragment>
        </Container>
    )
};
