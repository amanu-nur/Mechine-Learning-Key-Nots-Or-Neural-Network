let model;
let targetLabel = "C";
let state = "collection";

let notes = {
  C: 261.6256,
  D: 293.6648,
  E: 329.6276,
  F: 349.2,
  G: 392.0,
  A: 466.2,
  B: 492.9,
  R: 523.3,
};
let env, wave;

function setup() {
  createCanvas(600, 600);

  env = new p5.Env();
  env.setADSR(0.05, 0.1, 0.5, 1);
  env.setRange(1.2, 0);

  wave = new p5.Oscillator();

  wave.setType("sine");
  wave.start();
  wave.freq(440);
  wave.amp(env);

  let options = {
    inputs: ["x", "y"],
    outputs: ["label"],
    task: "classification",
    debug: "true",
  };
  model = ml5.neuralNetwork(options);
  background(200);
}

function keyPressed() {
  if (key == "t") {
    state = "Training";
    console.log("Starting Training");
    model.normalizeData();
    let options = {
      epochs: 200,
    };
    model.train(options, whileTraining, finishedTraining);
  } else {
    targetLabel = key.toUpperCase();
  }
}

function whileTraining(epoch, loss) {
  console.log(epoch);
}

function finishedTraining() {
  console.log("Finished Training");
  state = "Prediction";
}

function mousePressed() {
  let inputs = {
    x: mouseX,
    y: mouseY,
  };
  if (state == "collection") {
    let target = {
      label: targetLabel,
    };

    model.addData(inputs, target);
    stroke(0);
    noFill();
    ellipse(mouseX, mouseY, 24);
    fill(0);
    noStroke();
    text(targetLabel, mouseX, mouseY);
    textAlign(CENTER, CENTER);
    wave.freq(notes[targetLabel]);
    env.play();
  } else if (state == "Prediction") {
    model.classify(inputs, getResults);
  }
}

function getResults(error, results) {
  if (error) {
    console.log(error);
    return;
  }
  console.log(results);
  stroke(0);
  fill(0, 0, 255, 100);
  ellipse(mouseX, mouseY, 24);
  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);
  let label = results[0].label;
  text(label, mouseX, mouseY);
  wave.freq(notes[label]);
  env.play();
}
