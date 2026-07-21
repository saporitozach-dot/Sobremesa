#!/usr/bin/env ruby
# Wire the bundler-generated `Sobremesa/assets` folder into the app as a folder
# reference in Copy Bundle Resources — the same way main.jsbundle is handled.
#
# Without this, `export:embed` writes fonts/images to ios/Sobremesa/assets on disk
# but Xcode never copies them into the .app, so custom fonts fail to load at runtime
# and the app silently falls back to system fonts. Idempotent: safe to re-run.

require 'xcodeproj'

project_path = File.expand_path('../ios/Sobremesa.xcodeproj', __dir__)
project = Xcodeproj::Project.open(project_path)

target = project.targets.find { |t| t.name == 'Sobremesa' }
abort('Could not find Sobremesa target') unless target

REL_PATH = 'Sobremesa/assets'

already = target.resources_build_phase.files.any? do |bf|
  ref = bf.file_ref
  ref && ref.path == REL_PATH
end

if already
  puts "assets folder reference already present — nothing to do"
else
  # Blue folder reference: last_known_file_type = folder makes Xcode copy the
  # whole tree recursively, preserving the node_modules/... path the runtime expects.
  ref = project.main_group.new_reference(REL_PATH)
  ref.last_known_file_type = 'folder'
  ref.name = 'assets'
  target.resources_build_phase.add_file_reference(ref)
  project.save
  puts "added #{REL_PATH} to Copy Bundle Resources"
end
