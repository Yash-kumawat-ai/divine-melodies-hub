import json
import os

log_path = r"C:\Users\YASH\.gemini\antigravity-cli\brain\a0bf0f7f-782b-44f5-b0b8-e7288530cbcb\.system_generated\logs\transcript_full.jsonl"
output_dir = r"C:\Users\YASH\.gemini\antigravity-cli\brain\a0bf0f7f-782b-44f5-b0b8-e7288530cbcb\scratch"

os.makedirs(output_dir, exist_ok=True)

print("Scanning transcript for BlessingsPage.tsx tool calls...")

last_write = None
last_view = None

with open(log_path, "r", encoding="utf-8") as f:
    for line in f:
        try:
            data = json.loads(line)
            # check tool_calls
            tool_calls = data.get("tool_calls", [])
            for call in tool_calls:
                name = call.get("name")
                args = call.get("args", {})
                target_file = args.get("TargetFile") or args.get("AbsolutePath")
                if target_file and "BlessingsPage.tsx" in target_file:
                    if name in ("write_to_file", "replace_file_content", "multi_replace_file_content"):
                        last_write = (name, args, data.get("step_index"))
                    elif name == "view_file":
                        last_view = (name, args, data.get("step_index"))
        except Exception as e:
            pass

if last_write:
    print(f"Found last write tool call at step {last_write[2]}: {last_write[0]}")
    # Write details to a json file
    with open(os.path.join(output_dir, "last_write.json"), "w", encoding="utf-8") as outf:
        json.dump(last_write, outf, indent=2)
else:
    print("No write tool calls found for BlessingsPage.tsx.")

if last_view:
    print(f"Found last view tool call at step {last_view[2]}: {last_view[0]}")
    with open(os.path.join(output_dir, "last_view.json"), "w", encoding="utf-8") as outf:
        json.dump(last_view, outf, indent=2)
