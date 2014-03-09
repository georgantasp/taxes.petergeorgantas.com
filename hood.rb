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
  :select_cc => '0401',
  :district => '0416',
  :adv => '1',
  :out_type => '1',
  :ms_ln => '1000',
  :p_loc => ''
}

results = []
results.push(*(nj.perform_search(simple_options.merge({:block => '22.10'}))))
results.push(*(nj.perform_search(simple_options.merge({:block => '22.09'}))))
results.push(*(nj.perform_search(simple_options.merge({:block => '22.08'}))))
results.push(*(nj.perform_search(simple_options.merge({:block => '22.07'}))))


File.open('public/json/hood.json','w'){|f| f.write JSON.pretty_generate(results) }