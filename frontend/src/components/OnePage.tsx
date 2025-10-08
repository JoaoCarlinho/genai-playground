import { useActions, useValues } from 'kea'
import { BrowserRouter } from "react-router-dom";
import { Button, Container, Paper, Typography } from '@mui/material';
// import { HashLink } from "react-router-hash-link";
import { counterLogic } from '../AppLogic';
import CanvasDemo from './CanvasDemo';

interface GenAIDemo {
    name: string;
    description: string;
    hidden: boolean;
    component: string;
  }

// various pages

const demos = [
    {
        name : "Autonomous Vehicle Simulator",
        description: "A simulation environment for testing and developing autonomous vehicle algorithms and systems.",
        component: "CanvasDemo",
    },
    {
        name : "Configurable Recommender",
        description: "A RAG based recommender workflow providing capability to send multiple instruction sets to generative models with context added based on varying dimensions of Vector DBs.",
        component: "Recommender",
    },{
        name : "Resume coach",
        description: "A generative AI model that helps users create and improve their resumes by providing suggestions and feedback.",
    }
    ,{
        name : "Multi-use context-aided Agent",
        description: "A generative AI model that helps users create artifacts using shared context",
        component: "ApplicationSupport"
    },{
        name : "palm object detector inference",
        description: "the Yolov11 model extended to include the palm tree class, allowing for the detection of palm trees in images.",
    },
    {
        name : "stable diffusion",
        description: "A generative AI model that creates images from text prompts, allowing users to generate unique and creative visuals.",
    },
    {
        name :  "iaC cost predictor",
        description: "A model that predicts the cost of infrastructure as code (IaC) deployments, helping users estimate expenses before implementation.",
    }, 
    {
        name : "transformer based stock prediction",
        description: "A transformer-based model that predicts stock prices based on historical data and market trends, assisting users in making informed investment decisions.",
        component: "Stocks",
    },
    {
        name : "kea logic",
        description: "A simple example of managing state in the UI with kea",
        component: "LogicDemo",
    }
];

// single page app window
export default function OnePage () {
    const { setDisplayDemo } = useActions(counterLogic);
    const { displayDemo } = useValues(counterLogic);
    return(
        <BrowserRouter>
            <Container>
                {demos.map((demo) => (
                          <Paper key={demo.name} elevation={3}>
                            <Button onClick={() => {
                                setDisplayDemo(demo.name)
                            }}>{demo.name}</Button>
                          </Paper>
                        ))}
            </Container>
            {demos.map((demo) => (
                        demo.name == displayDemo &&
                          <section key={demo.name}>
                            <Typography variant="h1">{demo.name}</Typography>
                            <Typography variant="body1">{demo.description}</Typography>
                            {demo.component == 'CanvasDemo' && <CanvasDemo />}
                            {/* Add other components here based on demo.component */}
                          </section>
                        ))}
        </BrowserRouter>
    )
}