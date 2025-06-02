from flask import Flask, request, send_file, jsonify
from diffusers import DiffusionPipeline, DPMSolverMultistepScheduler
import torch
import io
from PIL import Image

app = Flask(__name__)

# Initialize model only once
model_id = "stable-diffusion-v1-5/stable-diffusion-v1-5"
pipeline = DiffusionPipeline.from_pretrained(
    model_id,
    torch_dtype=torch.float16,
    use_safetensors=True
)
pipeline.scheduler = DPMSolverMultistepScheduler.from_config(pipeline.scheduler.config)
# pipeline = pipeline.to("cuda")

@app.route("/generate-logo", methods=["POST"])
def generate_logo():
    try:
        data = request.get_json()
        prompt = data.get("prompt", "").strip()
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400

        generator = torch.Generator("cuda").manual_seed(0)

        image = pipeline(
            prompt,
            negative_prompt="low quality, noisy background, text, watermark, frame, clutter, asymmetry, overlapping shapes, excessive detail, black bars, abstract chaos",
            generator=generator,
            num_inference_steps=40
        ).images[0]

        # Save to a BytesIO object to send without saving to disk
        image_io = io.BytesIO()
        image.save(image_io, format="PNG")
        image_io.seek(0)

        return send_file(image_io, mimetype="image/png", as_attachment=False, download_name="logo.png")

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5001)
