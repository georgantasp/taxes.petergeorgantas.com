require 'sinatra'
require 'uri'
require 'net/http'
require 'nokogiri' 
require 'json'

Dir[File.dirname(__FILE__) + '/lib/*.rb'].each {|file| require file }

use Rack::Logger

helpers do
  def logger
    request.logger
  end
end

get '/search' do
  
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
  
  advanced_options = {
    :ms_user => 'monm',
    :passwd => '',
    :srch_type => '1',
    :select_cc => '0401',
    :district => '0416',
    :adv => '2',
    :out_type => '1',
    :ms_ln => '1000',
    :p_loc => '',
    :owner => '',
    :block => '',
    :lot => '',
    :qual => '',
    :street => '',
    :city => '',
    :class => '2',
    :sr1a_f => '0',
    :sale_from => '2012-01-01',
    :sale_to => '2014-02-01',
    :cl_type => ' ',
    :zone => '',
    :book => '',
    :page => '',
    :built_f => '0',
    :built_t => '0',
    :sqft_f => '0',
    :sqft_t => '0',
    :land_f => '0',
    :land_t => '0',
    :impr_f => '0',
    :impr_t => '0',
    :net_f => '0',
    :net_t => '0',
    :sale_f => '0',
    :sale_t => '0'
  }
  
  # puts "merge options #{JSON.pretty_generate(params)} results"
  # 
  # params_sym = params.inject({}){|memo,(k,v)| memo[k.to_sym] = v; memo}
  # 
  # options = params[:adv] == 1 ? simple_options.merge(params_sym) : advanced_options.merge(params_sym)
  # 
  # puts "requesting search with options: #{JSON.pretty_generate(options)}"

  results = []
  results.push(*(nj.perform_search(simple_options.merge({:block => '22.10'}))))
  results.push(*(nj.perform_search(simple_options.merge({:block => '22.09'}))))
  results.push(*(nj.perform_search(simple_options.merge({:block => '22.08'}))))
  results.push(*(nj.perform_search(simple_options.merge({:block => '22.07'}))))
  
  
  content_type :json
  results.sort_by{ |hsh| hsh[:ass_2013] }.to_json
end
