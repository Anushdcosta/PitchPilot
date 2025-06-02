from diffusers import DiffusionPipeline
import torch

model_id = "stable-diffusion-v1-5/stable-diffusion-v1-5"
pipeline = DiffusionPipeline.from_pretrained(model_id,torch_dtype=torch.float16, use_safetensors=True)
from diffusers import DPMSolverMultistepScheduler

pipeline.scheduler = DPMSolverMultistepScheduler.from_config(pipeline.scheduler.config)
pipeline = pipeline.to("cuda")
while True:
    prompt = input()
    
    generator = torch.Generator("cuda").manual_seed(0)
    image = pipeline(prompt,negetive_prompt = "low quality, noisy background, text, watermark, frame, clutter, asymmetry, overlapping shapes, excessive detail, black bars, abstract chaos"
, generator=generator,  num_inference_steps=40).images[0]
    image.save("mynigaa.png")