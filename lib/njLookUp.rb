
class NjLookUp

  def perform_search(options)
    uri = URI.parse("http://tax1.co.monmouth.nj.us/cgi-bin/inf.cgi")
    http = Net::HTTP.new(uri.host, uri.port)
  
    request = Net::HTTP::Post.new(uri.request_uri)
    request.content_type = 'application/x-www-form-urlencoded'
    request.set_form_data(options)
  
    puts "Making Main Request"
    response = http.request(request)
  
    result = parse_search_body(response.body, options[:district])
  
    result
  end


  def parse_search_body(body, district)
    page = Nokogiri::HTML(body)
    links = page.css('table a')
    results = []
    links.each_with_index do |link, index|
      if(index % 100 == 0)
        puts "Finished Requests for #{index}/#{links.size}"
      end
        
      suburi = URI.parse("http://tax1.co.monmouth.nj.us/cgi-bin/" + link["href"]);
    
      subresponse = Net::HTTP.get(suburi)
      subpage = Nokogiri::HTML(subresponse)
      tables = subpage.css('table')
    
      table1_rows = tables[0].css('tr')
    
      result = {}
      result[:link] = suburi.to_s
      result[:class] = table1_rows[2].css('td')[3].text.strip
      result[:year_built] = table1_rows[1].css('td')[7].text.strip.to_i
      result[:block] = table1_rows[0].css('td')[1].text.strip
      result[:lot] = table1_rows[1].css('td')[1].text.strip
      result[:street_address] = table1_rows[0].css('td')[3].text.strip
      result[:city_state] = table1_rows[1].css('td')[3].text.gsub('&nbsp'){}.gsub(district){}.strip
      result[:sq_foot] = Integer(table1_rows[0].css('td')[7].text.strip)
      result[:acreage] = Float(table1_rows[8].css('td')[5].text.strip)
      result[:taxes] = Float(table1_rows[8].css('td')[7].text.strip.split(" / ")[0].strip)
      if(table1_rows[9].text.include?('Sale Information') && Integer(table1_rows[10].css('td')[5].css('font')[0].text.strip) > 10)
        result[:sale_date] = table1_rows[10].css('td')[1].text.strip
        result[:sale_price] = Integer(table1_rows[10].css('td')[5].css('font')[0].text.strip)
      end
      
      puts "    #{result[:street_address]}"
    
      table3_rows = tables[2].css('tr')
    
      if(table3_rows[0].text.include? 'TAX-LIST-HISTORY')
        result[:tax_records] = {}
        
        years = (2011..2014).to_a.reverse
        years.each_with_index do |year, year_index|
          lnd = get_integer(table3_rows[2 + (year_index*4)].css('td')[2].text)
          imp = get_integer(table3_rows[2 + (year_index*4)].css('td')[2].text)
          exp = get_integer(table3_rows[3 + (year_index*4)].css('td')[3].text)
          ass = get_integer(table3_rows[2 + (year_index*4)].css('td')[4].text)
          
          if(lnd != nil && result[:acreage] > 0)
            lnd_psqf = lnd.to_f / result[:acreage]
          else
            lnd_psqf = nil
          end
          
          if(imp != nil && result[:sq_foot] > 0)
            imp_psqf = imp.to_f / result[:sq_foot]
          else
            imp_psqf = nil
          end
          
          result[:tax_records][year] = {
            :lnd => lnd,
            :imp => imp,
            :exp => exp,
            :ass => ass,
            :lnd_psqf => lnd_psqf,
            :imp_psqf => imp_psqf
          }
        end
        
        result[:tax_rate] = result[:taxes].to_f / result[:tax_records][2014][:ass]
        if(result[:sale_price])
          result[:ratio] = Float(result[:tax_records][2014][:ass]) / Float(result[:sale_price])
        end
      end
    
      results << result
    end
    results
  end

  def get_integer (arg)
    a = (arg.gsub('&nbsp'){}).strip
    if a.length > 1
      Integer(a)
    else
      nil
    end
  end
  
end