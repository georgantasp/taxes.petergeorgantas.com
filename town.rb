require 'uri'
require 'net/http'
require 'nokogiri' 
require 'json'

Dir[File.dirname(__FILE__) + '/lib/*.rb'].each {|file| require file }

nj = NjLookUp.new

simple_options = {
  :ms_user => 'monm',
  :passwd => 'data',
  :srch_type => '1',
  :select_cc => '0401', #camden county
  :district => '0416', # haddon township
  :adv => '1',
  :out_type => '1',
  :ms_ln => '10000',
  :p_loc => ''
}

results = nj.perform_search(simple_options);

results = results.select{|r| r[:class] == "2" }

File.open('public/json/town.json','w'){|f| f.write JSON.pretty_generate(results) }